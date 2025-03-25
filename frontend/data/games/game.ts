"use server";

import { auth } from "@/auth";
import { db as prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { addLog } from "../log/addLog";
import { goldValidator } from "../validators/validators";

export const initializeGame = async (userId: string, gameName: string) => {
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

export const startGame = async (gameId: string) => {
  const session = await auth();
  if (!session || session?.user.role === "NEW") {
    return "Not authorized";
  }
  return await prisma.$transaction(async (db) => {
    const game = await db.game.update({
      where: { id: gameId, status: "PENDING" },
      data: { status: "INPROGRESS", startedAt: new Date() },
    });
    if (!game) {
      return "Invalid game session";
    }
    return true;
  });
};

export const updateGame = async (
  gameId: string,
  charIndex: number,
  mistakes: number,
) => {
  const session = await auth();
  if (!session || session?.user.role === "NEW") {
    return "Not authorized";
  }
  return await prisma.$transaction(async (db) => {
    const game = await db.game.findUnique({
      where: { id: gameId },
    });

    if (
      !game ||
      game.userId !== session.user.id ||
      game.status !== "INPROGRESS"
    ) {
      return "Invalid game state";
    }

    const maxTime = 60;
    const timeElapsed =
      (new Date().getTime() - new Date(game.startedAt).getTime()) / 1000;
    const time = maxTime - timeElapsed;
    const correctChars = charIndex - mistakes;
    const totalTime = maxTime - time;

    // words per minute. Mathmatical standard is 5 characters per word
    let wpm = Math.round((correctChars / 5 / totalTime) * 60);
    wpm = wpm < 0 || !wpm || wpm == Infinity ? 0 : Math.floor(wpm);

    // characters per minute
    let cpm = correctChars * (60 / totalTime);
    cpm = cpm < 0 || !cpm || cpm == Infinity ? 0 : Math.floor(cpm);

    // unrealistic values cancel the game
    if (charIndex > 800 || wpm > 120) {
      await db.game.delete({
        where: { id: gameId, status: "INPROGRESS" },
      });
      return "Invalid game state, game aborted";
    }

    const mistakePenalty = 1 - mistakes / (charIndex + 1);
    const score = Math.floor(cpm * 2 * mistakePenalty + charIndex);
    const totalCharacters = charIndex;

    const metadata = {
      wpm,
      cpm,
      totalCharacters,
      mistakes,
    };

    await db.game.update({
      where: { id: gameId },
      data: { score, metadata },
    });
    return { wpm, cpm, score };
  });
};

export const finishGame = async (gameId: string) => {
  const session = await auth();
  if (!session || session?.user.role === "NEW") {
    return "Not authorized";
  }
  try {
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

      const gold = await goldValidator(db, game.userId, game.score);

      const targetUser = await db.user.update({
        where: { id: game.userId },
        data: { gold: { increment: gold } },
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
        `GAME: ${targetUser.username} finished a game of TypeQuest, and recieved ${gold} gold`,
      );
      return { message: "Recieved " + gold + " gold", gold };
    });
  } catch (error) {
    logger.error("Error finishing up game: " + error);
    return (
      "Something went wrong. Please inform a game master of this timestamp: " +
      Date.now().toLocaleString("no-NO")
    );
  }
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

export const getGameLeaderboard = async (gameName: string) => {
  const session = await auth();
  if (!session || session?.user.role === "NEW") {
    throw new Error("Not authorized");
  }

  const leaderboard = await prisma.game.findMany({
    where: { game: gameName, status: "FINISHED" },
    select: {
      score: true,
      metadata: true,
      user: {
        select: {
          title: true,
          image: true,
          name: true,
          username: true,
          lastname: true,
        },
      },
    },
    orderBy: {
      score: "desc",
    },
    take: 10,
  });

  return leaderboard;
};
