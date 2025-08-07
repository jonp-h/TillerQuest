"use server";

import { db } from "@/lib/db";
import { addLog } from "../log/addLog";
import { logger } from "@/lib/logger";
import { DiceRoll, exportFormats } from "@dice-roller/rpg-dice-roller";
import {
  experienceAndLevelValidator,
  goldValidator,
} from "../validators/validators";
import { Ability } from "@prisma/client";
import {
  AuthorizationError,
  checkActiveUserAuth,
  checkUserIdAndActiveAuth,
} from "@/lib/authUtils";
import { ErrorMessage } from "@/lib/error";

export const startGuildBattle = async (userId: string) => {
  await checkUserIdAndActiveAuth(userId);

  try {
    return await db.$transaction(async (db) => {
      const guild = await db.guild.findFirst({
        where: { guildLeader: userId },
      });

      if (!guild) {
        throw new ErrorMessage("Only the guild leader can start a battle.");
      }

      const totalEnemies = await db.enemy.count();
      const randomOffset = Math.floor(Math.random() * totalEnemies);

      const enemy = await db.enemy.findFirst({
        select: {
          id: true,
          name: true,
          icon: true,
        },
        orderBy: {
          name: "asc",
        },
        skip: randomOffset,
      });

      if (!enemy) {
        throw new Error("No enemy found for the battle.");
      }

      const maxHealth = Math.floor(Math.sqrt(guild.level) * 12 * 5);
      const attack = Math.floor(Math.sqrt(guild.level) + 0.5);
      const xp = Math.floor(Math.sqrt(guild.level) * 80);
      const gold = Math.floor(guild.level * 50);

      // Number of enemies scales with guild level: 1 at low levels, up to 4 at high levels
      const maxEnemies = 5;
      // Use sqrt(level) to bias towards more enemies at higher levels
      const levelFactor = Math.sqrt(guild.level);
      // Clamp between 1 and maxEnemies
      const numberOfEnemies = Math.min(maxEnemies, 1 + Math.floor(levelFactor));

      const enemyHealth = Math.floor(maxHealth / numberOfEnemies);
      const enemyXp = Math.floor(xp / numberOfEnemies);
      const enemyGold = Math.floor(gold / numberOfEnemies);

      for (let i = 0; i < numberOfEnemies; i++) {
        await db.guildEnemy.create({
          data: {
            guildName: guild.name,
            enemyId: enemy.id,
            icon: enemy.icon,
            name: enemy.name,
            health: enemyHealth,
            maxHealth: enemyHealth,
            attack: attack,
            xp: enemyXp,
            gold: enemyGold,
          },
        });
      }

      await addLog(
        db,
        userId,
        `DUNGEON: ${guild.name} has started a guild battle against ${enemy.name}.`,
      );

      return `Battle started against ${enemy.name}!`;
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn(
        "Unauthorized access attempt to start guild battle for user: " + userId,
      );
      throw error;
    }

    if (error instanceof ErrorMessage) {
      throw error;
    }

    logger.error("Error starting guild battle: " + error);
    throw new Error(
      "Something went wrong while starting the guild battle. Please inform a game master of this timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

export const getEnemies = async (userId: string) => {
  try {
    await checkActiveUserAuth();

    const user = await db.user.findUnique({
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

    const enemy = await db.guildEnemy.findMany({
      where: {
        guildName: user.guildName,
      },
      select: {
        id: true,
        icon: true,
        maxHealth: true,
        enemyId: true,
        guildName: true,
        health: true,
        name: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    return enemy;
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

export async function getUserTurns(userId: string) {
  try {
    await checkActiveUserAuth();

    const turns = await db.user.findFirst({
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

    return await db.$transaction(async (db) => {
      const user = await db.user.findUnique({
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

      const enemy = await db.guildEnemy.findFirst({
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
  return await db.$transaction(async (db) => {
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
  return await db.$transaction(async (db) => {
    const users = await db.user.findMany({
      where: {
        guildName: guild,
      },
    });
    const rewards = await db.guildEnemy.findFirst({
      where: { id: enemyId },
      select: {
        name: true,
        xp: true,
        gold: true,
      },
    });

    if (!rewards) {
      logger.error("No rewards found for enemy: " + enemyId);
      return;
    }

    for (const user of users) {
      await experienceAndLevelValidator(db, user, rewards.xp);
      const goldToGive = await goldValidator(db, user.id, rewards?.gold);
      await db.user.update({
        where: { id: user.id },
        data: { gold: { increment: goldToGive } },
      });
      await addLog(
        db,
        user.id,
        `DUNGEON: ${rewards.name} has been slain, ${user.username} gained ${rewards.xp} XP and ${rewards.gold} gold.`,
      );
    }
  });
}
