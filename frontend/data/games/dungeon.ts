"use server";

import { auth } from "@/auth";
import { db as prisma } from "@/lib/db";
import { addLog } from "../log/addLog";
import { logger } from "@/lib/logger";

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

  const enemies = await prisma.enemy.findFirst({
    select: {
      name: true,
      icon: true,
      attack: true,
      health: true,
      xp: true,
      gold: true,
    },
    orderBy: {
      name: "asc",
    },
    skip: randomOffset,
  });
  return enemies;
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

export async function finishTurn() {
  const session = await auth();

  if (
    !session ||
    (session?.user.role !== "USER" && session?.user.role !== "ADMIN")
  ) {
    throw new Error("Not authorized");
  }
  const gameFinished = true;
  try {
    return await prisma.$transaction(async (db) => {
      const targetUser = await db.user.update({
        where: { id: session.user.id },
        data: { turnFinished: gameFinished },
        select: {
          id: true,
          username: true,
        },
      });
      await addLog(
        db,
        targetUser.id,
        `DUNGEON: ${targetUser.username} finished their turn in the dungeon`,
      );
    });
  } catch (error) {
    logger.error("Error finishing up turn: " + error);
    return (
      "Something went wrong. Please inform a game master of this timestamp: " +
      Date.now().toLocaleString("no-NO")
    );
  }
  console.log("Turn finished!");
}
