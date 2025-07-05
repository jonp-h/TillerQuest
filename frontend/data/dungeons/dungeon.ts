"use server";

import { db as prisma } from "@/lib/db";
import { addLog } from "../log/addLog";
import { logger } from "@/lib/logger";
import { DiceRoll, exportFormats } from "@dice-roller/rpg-dice-roller";
import {
  experienceAndLevelValidator,
  goldValidator,
} from "../validators/validators";
import { Ability } from "@prisma/client";
import { GuildEnemyWithEnemy } from "@/app/(protected)/dungeons/_components/interfaces";
import {
  AuthorizationError,
  checkActiveUserAuth,
  checkUserIdAndActiveAuth,
} from "@/lib/authUtils";

export const getEnemies = async (userId: string) => {
  try {
    await checkActiveUserAuth();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        guildName: true, // Select the guildName
      },
    });

    if (!user?.guildName) {
      logger.warn(
        "User " + userId + " is not in a guild. Tried to fetch enemy.",
      );
      return null;
    }

    const enemy = await prisma.guildEnemy.findMany({
      where: {
        guildName: user.guildName,
      },
      select: {
        enemy: {
          select: {
            icon: true,
            maxHealth: true,
          },
        },
        id: true,
        enemyId: true,
        guildName: true,
        health: true,
        name: true,
      },
      orderBy: {
        id: "asc",
      },
    });
    if (!enemy) {
      return;
    }

    return enemy.map((enemy) => ({
      id: enemy.id,
      name: enemy.name,
      health: enemy.health,
      guildName: enemy.guildName,
      enemyId: enemy.enemyId,
      icon: enemy.enemy.icon,
      maxHealth: enemy.enemy.maxHealth,
    })) as GuildEnemyWithEnemy[];
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn(
        "Unauthorized access attempt to get enemies for user: " + userId,
      );
      throw error;
    }

    logger.error("Error fetching enemy: " + error);
    throw new Error(
      "Error fetching enemy. Please inform a game master of this timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

// TODO: Rework
// export const getRandomEnemy = async () => {
//   const session = await auth();
//   if (
//     !session ||
//     (session?.user.role !== "USER" && session?.user.role !== "ADMIN")
//   ) {
//     throw new Error("Not authorized");
//   }

//   const totalEnemies = await prisma.enemy.count();
//   const randomOffset = Math.floor(Math.random() * totalEnemies);

//   const enemy = await prisma.enemy.findFirst({
//     select: {
//       name: true,
//       icon: true,
//       attack: true,
//       health: true,
//       maxHealth: true,
//       xp: true,
//       gold: true,
//     },
//     orderBy: {
//       name: "asc",
//     },
//     skip: randomOffset,
//   });
//   return enemy;
// };

export async function getUserTurns(userId: string) {
  try {
    await checkActiveUserAuth();

    const turns = await prisma.user.findFirst({
      where: { id: userId },
      select: {
        turns: true,
      },
    });
    return turns || { turns: 0 };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access attempt to get user turns: " + userId);
      throw error;
    }

    logger.error("Error checking turn: " + error);
    return { turns: 0 };
  }
}

export async function selectDungeonAbility(
  userId: string,
  ability: Ability,
  targetEnemyId: string | null,
) {
  try {
    await checkUserIdAndActiveAuth(userId);

    return await prisma.$transaction(async (db) => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          hp: true,
          guildName: true,
          turns: true,
        },
      });

      if (!user || !user?.guildName || targetEnemyId === null) {
        logger.error("Error when attempting to use dungeon ability: " + userId);
        return { message: "Error when attempting to use dungeon ability" };
      }

      if (user.hp <= 0) {
        return { message: "You are dead." };
      }

      if (user?.turns <= 0) {
        return { message: "You have no turns left!" };
      }

      const userOwnsAbility = await db.userAbility.findFirst({
        where: { userId: user.id, abilityName: ability.name },
      });

      if (!userOwnsAbility || !ability.diceNotation) {
        return { message: "User doesn't own the ability" };
      }

      const enemy = await prisma.guildEnemy.findFirst({
        where: { id: targetEnemyId },
        select: {
          health: true,
        },
      });

      if (!enemy || enemy?.health <= 0) {
        return { message: "The enemy is already dead!" };
      }

      const diceResult = rollDice(ability?.diceNotation);

      await damageEnemy(targetEnemyId, diceResult.total);

      await db.user.update({
        where: { id: userId },
        data: { turns: { decrement: 1 } },
      });

      await addLog(
        db,
        userId,
        `DUNGEON: ${user.username} finished their turn and rolled ${diceResult.total} damage.`,
      );

      return {
        message: "Rolled " + diceResult.total + "!",
        diceRoll:
          "output" in diceResult
            ? diceResult.output.split("[")[1].split("]")[0]
            : "",
      };
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn(
        "Unauthorized access attempt to use dungeon ability: " + userId,
      );
      throw error;
    }

    logger.error("Error finishing up turn: " + error);
    return (
      "Something went wrong. Please inform a game master of this timestamp: " +
      Date.now().toLocaleString("no-NO")
    );
  }
}
//TODO: should be moved to lib. Named Roll or rollDice, depending on project availability
const rollDice = (diceNotation: string) => {
  const roll = new DiceRoll(diceNotation);
  // @ts-expect-error - the package's export function is not typed correctly
  return roll.export(exportFormats.OBJECT) as {
    averageTotal: number;
    maxTotal: number;
    minTotal: number;
    notation: string;
    output: string;
    // rolls: any[];
    total: number;
    type: string;
  };
};

async function damageEnemy(targetEnemyId: string, diceResult: number) {
  return await prisma.$transaction(async (db) => {
    console.log("Dealing damage to enemy: " + targetEnemyId);
    const enemy = await db.guildEnemy.update({
      where: {
        id: targetEnemyId,
      },
      data: { health: { decrement: diceResult } },
      select: {
        health: true,
        guildName: true,
      },
    });

    // rewards are only given when the enemy is killed
    if (enemy.health <= 0) {
      await rewardUsers(targetEnemyId, enemy.guildName);
    }
  });
}

async function rewardUsers(enemyId: string, guild: string) {
  return await prisma.$transaction(async (db) => {
    const users = await db.user.findMany({
      where: {
        guildName: guild,
      },
    });
    const rewards = await db.guildEnemy.findFirst({
      where: { id: enemyId },
      select: {
        enemy: {
          select: {
            name: true,
            xp: true,
            gold: true,
          },
        },
      },
    });

    if (!rewards) {
      logger.error("No rewards found for enemy: " + enemyId);
      return;
    }

    for (const user of users) {
      await experienceAndLevelValidator(db, user, rewards.enemy.xp);
      const goldToGive = await goldValidator(db, user.id, rewards?.enemy.gold);
      await db.user.update({
        where: { id: user.id },
        data: { gold: { increment: goldToGive } },
      });
      await addLog(
        db,
        user.id,
        `DUNGEON: ${rewards.enemy.name} has been slain, ${user.username} gained ${rewards.enemy.xp} XP and ${rewards.enemy.gold} gold.`,
      );
    }
  });
}
