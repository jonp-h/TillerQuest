"use server";

import { auth } from "@/auth";
import { db as prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { addLog } from "../log/addLog";
import { createHmac } from "crypto";

export const startGame = async (userId: string, gameName: string) => {
  const session = await auth();
  if (!session || !session?.user.id || session?.user.id !== userId) {
    return "Not authorized";
  }
  return await prisma.$transaction(async (db) => {
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

    const game = await db.game.create({
      data: {
        userId: user.id,
        game: gameName,
      },
    });

    return game.id;
  });
};

// export const updateGame = async (gameId: string, score: number) => {
//   const session = await auth();
//   if (!session || session?.user.role === "NEW") {
//     return "Not authorized";
//   }
//   return await prisma.$transaction(async (db) => {
//     const game = await db.game.findUnique({
//       where: { id: gameId },
//     });

//     if (
//       !game ||
//       game.userId !== session.user.id ||
//       game.status !== "INPROGRESS"
//     ) {
//       return "Invalid game session";
//     }

//     await db.game.update({
//       where: { id: gameId },
//       data: { score },
//     });
//     return "Updated";
//   });
// };

const verifyHmac = (gameId: string, score: number, hmac: string) => {
  const secretKey = process.env.HMAC_SECRET_KEY;
  if (!secretKey) {
    throw new Error("HMAC_SECRET_KEY not set");
  }
  const expectedHmac = createHmac("sha256", secretKey)
    .update(`${gameId}:${score}`)
    .digest("hex");
  return expectedHmac === hmac;
};

export const finishGame = async (
  gameId: string,
  score: number,
  hmac: string,
) => {
  const session = await auth();
  if (!session || session?.user.role === "NEW") {
    return "Not authorized";
  }

  if (!verifyHmac(gameId, score, hmac)) {
    return "Invalid data";
  }

  return await prisma.$transaction(async (db) => {
    const game = await db.game.findUnique({
      where: { id: gameId },
      include: { user: true },
    });

    if (
      !game ||
      game.userId !== session.user.id ||
      game.status !== "INPROGRESS"
    ) {
      return "Invalid game session";
    }

    const targetUser = await db.user.update({
      where: { id: game.userId },
      data: { gold: { increment: game.score } },
      select: {
        username: true,
      },
    });

    await db.game.update({
      where: { id: gameId },
      data: { status: "FINISHED" },
    });

    await addLog(
      db,
      game.userId,
      `GAME: ${targetUser.username} finished a game of TypeQuest, and recieved ${game.score} gold`,
    );
    return "Recieved " + game.score + " gold";
  });
};

export const getRandomTypeQuestText = async () => {
  const session = await auth();
  if (
    !session ||
    (session?.user.role !== "USER" && session?.user.role !== "ADMIN")
  ) {
    throw new Error("Not authorized");
  }

  const typeQuestText = await prisma.typeQuestText.findFirst({
    select: {
      text: true,
    },
    orderBy: {
      id: "asc",
    },
    skip: Math.floor(Math.random() * (await prisma.typeQuestText.count())),
  });

  return typeQuestText;
};
