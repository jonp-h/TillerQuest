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
    const enemy = await prisma.enemy.findFirst({
      select: {
        id: true,
        name: true,
        icon: true,
        attack: true,
        health: true,
        maxHealth: true,
        xp: true,
        gold: true,
      },
      orderBy: {
        id: "asc",
      },
    });
    return enemy;
  } catch (error) {
    logger.error("Error fetching enemy: " + error);
  }
};
export const getRandomEnemy = async () => {
  const session = await auth();
  if (
    !session ||
    (session?.user.role !== "USER" && session?.user.role !== "ADMIN")
  ) {
    throw new Error("Not authorized");
  }

  const totalEnemies = await prisma.enemy.count();
  const randomOffset = Math.floor(Math.random() * totalEnemies);

  const enemy = await prisma.enemy.findFirst({
    select: {
      name: true,
      icon: true,
      attack: true,
      health: true,
      maxHealth: true,
      xp: true,
      gold: true,
    },
    orderBy: {
      name: "asc",
    },
    skip: randomOffset,
  });
  return enemy;
};

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
        turnFinished: true,
      },
    });
    return turnStatus;
  } catch (error) {
    logger.error("Error checking turn: " + error);
  }
}

export async function finishTurn(diceRoll: string, boss: number) {
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
      const bossDamage = await db.enemy.update({
        where: { id: boss },
        data: { health: { decrement: damage } },
      });
      const currentBoss = await db.enemy.findFirst({
        where: { id: boss },
      });
      // TODO: Implement rewards for defeating boss to all the users
      if (bossDamage.health <= 0) {
        if (!currentBoss) {
          return;
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const updateBoss = await db.enemy.update({
          where: { id: boss },
          data: { health: 0, icon: "/classes/Grave.png" },
        });
        rewardUsers(currentBoss.xp, currentBoss.gold);
      }

      // Update turn for user
      const targetUser = await db.user.update({
        where: { id: session.user.id },
        data: { turnFinished: true },
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
