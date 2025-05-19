/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { auth } from "@/auth";
import { db as prisma } from "@/lib/db";
import { addLog } from "../log/addLog";
import { logger } from "@/lib/logger";
import { DiceRoll, exportFormats } from "@dice-roller/rpg-dice-roller";
import {
  experienceAndLevelValidator,
  goldValidator,
} from "../validators/validators";
import { Ability } from "@prisma/client";

// TODO: Move getting enemies to backend
// add new field in DB to specify that the boss has been picked

export const getEnemy = async () => {
  const session = await auth();
  if (
    !session ||
    (session?.user.role !== "USER" && session?.user.role !== "ADMIN")
  ) {
    throw new Error("Not authorized");
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id: session?.user.id },
      select: {
        guildName: true, // Select the guildName
      },
    });

    if (!user?.guildName) {
      console.warn("User is not in a guild.");
      return null;
    }

    const enemy = await prisma.guildEnemy.findFirst({
      where: {
        guildName: user.guildName,
      },
    });
    if (!enemy) {
      return;
    }

    return enemy;
  } catch (error) {
    logger.error("Error fetching enemy: " + error);
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

export async function isTurnFinished() {
  const session = await auth();
  if (
    !session ||
    (session?.user.role !== "USER" && session?.user.role !== "ADMIN")
  ) {
    throw new Error("Not authorized");
  }

  try {
    const turnStatus = await prisma.user.findFirst({
      where: { id: session.user.id },
      select: {
        turns: true,
      },
    });
    return turnStatus;
  } catch (error) {
    logger.error("Error checking turn: " + error);
  }
}

// TODO: Rework function to simplify names
export async function finishTurn(diceRoll: string) {
  const session = await auth();

  if (
    !session ||
    (session?.user.role !== "USER" && session?.user.role !== "ADMIN")
  ) {
    throw new Error("Not authorized");
  }
  try {
    return await prisma.$transaction(async (db) => {
      const damageRollResult = rollDice(diceRoll);
      const damage = damageRollResult.total;

      const user = await prisma.user.findUnique({
        where: { id: session?.user.id },
        select: {
          guildName: true,
        },
      });

      if (!user?.guildName) {
        console.warn("User is not in a guild.");
        return null;
      }

      const enemyDamage = await db.guildEnemy.update({
        where: {
          enemyId_guildName: {
            enemyId: 1,
            guildName: user.guildName,
          },
        },
        data: { health: { decrement: damage } },
      });
      const enemyBoss = await db.guildEnemy.findFirst({
        where: { guildName: user.guildName },
      });

      if (!enemyBoss?.health) {
        return;
      }
      // TODO: Implement rewards for defeating boss to all the users
      if (enemyBoss.health <= 0) {
        rewardUsers(300, 300); // temp value
      }

      // Update turn for user
      const targetUser = await db.user.update({
        where: { id: session.user.id },
        data: { turns: 1 },
        select: {
          id: true,
          username: true,
        },
      });
      await addLog(
        db,
        targetUser.id,
        `DUNGEON: ${targetUser.username} finished their turn and dealt ${damage} damage.`,
      );
      return damage;
    });
  } catch (error) {
    logger.error("Error finishing up turn: " + error);
    return (
      "Something went wrong. Please inform a game master of this timestamp: " +
      Date.now().toLocaleString("no-NO")
    );
  }
}

export async function useDungeonAbility(userId: string, ability: Ability) {
  const session = await auth();
  if (
    !session ||
    (session?.user.role !== "USER" && session?.user.role !== "ADMIN")
  ) {
    throw new Error("Not authorized");
  }
  try {
    return await prisma.$transaction(async (db) => {
      if (!ability.diceNotation) {
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: session?.user.id },
        select: {
          guildName: true,
        },
      });

      if (!user?.guildName) {
        console.warn("User is not in a guild.");
        return null;
      }

      const userOwnsAbility = await db.userAbility.findFirst({
        where: { userId, abilityName: ability.name },
      });

      if (!userOwnsAbility) {
        console.log("User doesn't own the ability!");
        return;
      }
      // TODO: Check guilds active enemy
      // const activeEnemy = await db.GuildEnemy.guild

      const damageRollResult = rollDice(ability?.diceNotation);
      const damage = damageRollResult.total;
      const enemyDamage = await db.guildEnemy.update({
        where: {
          enemyId_guildName: {
            enemyId: 1,
            guildName: user.guildName,
          },
        },
        data: { health: { decrement: damage } },
      });
      const currentEnemy = await db.guildEnemy.findFirst({
        where: { guildName: user.guildName },
      });
      if (!currentEnemy) {
        return;
      }

      if (currentEnemy.health <= 0) {
        console.log("enemy is already dead");
        return;
      }

      // TODO: Implement rewards for defeating boss to all the users

      // Update turn for user
      const targetUser = await db.user.update({
        where: { id: session.user.id },
        data: { turns: 1 },
        select: {
          id: true,
          username: true,
        },
      });
      await addLog(
        db,
        targetUser.id,
        `DUNGEON: ${targetUser.username} finished their turn and dealt ${damage} damage.`,
      );
      if (enemyDamage.health <= 0) {
        const updateEnemy = await db.enemy.update({
          where: { id: enemyId },
          data: { health: 0 },
        });
        rewardUsers(300, 300);
      }
      return damage;
    });
  } catch (error) {
    logger.error("Error finishing up turn: " + error);
    return (
      "Something went wrong. Please inform a game master of this timestamp: " +
      Date.now().toLocaleString("no-NO")
    );
  }
}

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

async function rewardUsers(xp: number, gold: number) {
  const session = await auth();

  if (
    !session ||
    (session?.user.role !== "USER" && session?.user.role !== "ADMIN")
  ) {
    throw new Error("Not authorized");
  }
  try {
    return await prisma.$transaction(async (db) => {
      const users = await db.user.findMany({
        distinct: ["id"],
      });

      for (const user of users) {
        await experienceAndLevelValidator(db, user, xp);
        const goldToGive = await goldValidator(db, user.id, user.gold);
        await db.user.update({
          where: { id: user.id },
          data: { gold: { increment: goldToGive } },
        });
        await addLog(
          db,
          user.id,
          `DUNGEON: The boss has been slain, ${user.username} gained ${xp} XP and ${gold} gold.`,
        );
      }
    });
  } catch (error) {
    logger.error("Error rewarding users: " + error);
    return (
      "Something went wrong. Please inform a game master of this timestamp: " +
      Date.now().toLocaleString("no-NO")
    );
  }
}

// async function isBossDead(guild: string) {}
