"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { addLog } from "../log/addLog";

export const startGame = async (userId: string) => {
  const session = await auth();
  if (!session || !session?.user.id || session?.user.id !== userId) {
    return "Not authorized";
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      arenaTokens: true,
    },
  });

  if (!user) {
    logger.error(
      `id: ${session.user.id} tried to start a game, but the user was not found`,
    );
    return "User not found";
  }

  if (user.arenaTokens < 1) {
    return false;
  }

  await db.user.update({
    where: { id: user.id },
    data: { arenaTokens: { decrement: 1 } },
  });
  return true;
};

export const finishGame = async (userId: string, score: number) => {
  const session = await auth();
  if (!session || !session?.user.id || session?.user.id !== userId) {
    return "Not authorized";
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { username: true },
  });

  if (!user) {
    logger.error(
      `User ${session.user.username} tried to finish a game, but the user was not found`,
    );
    return "User not found";
  }

  await addLog(
    db,
    userId,
    `GAME: ${user?.username} finished a game of TypeQuest, and recieved ${score} gold`,
  );

  await db.user.update({
    where: { id: userId },
    data: { gold: { increment: score } },
  });
  return "Recieved " + score + " gold";
};

export const getRandomTypeQuestText = async () => {
  const session = await auth();
  if (
    !session ||
    (session?.user.role !== "USER" && session?.user.role !== "ADMIN")
  ) {
    throw new Error("Not authorized");
  }

  const typeQuestText = await db.typeQuestText.findFirst({
    select: {
      text: true,
    },
    orderBy: {
      id: "asc",
    },
    skip: Math.floor(Math.random() * (await db.typeQuestText.count())),
  });

  return typeQuestText;
};
