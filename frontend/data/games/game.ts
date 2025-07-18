"use server";

import { db as prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { addLog } from "../log/addLog";
import { goldValidator } from "../validators/validators";
import {
  AuthorizationError,
  checkActiveUserAuth,
  checkUserIdAndActiveAuth,
} from "@/lib/authUtils";
import { ErrorMessage } from "@/lib/error";
import { $Enums } from "@prisma/client";
import { addAnalytics } from "../analytics/analytics";

export const initializeGame = async (userId: string, gameName: string) => {
  try {
    await checkUserIdAndActiveAuth(userId);

    return await prisma.$transaction(async (db) => {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          arenaTokens: true,
          access: true,
        },
      });

      if (!user) {
        throw new Error("User not found when starting a game");
      }

      if (!user.access.includes(gameName as $Enums.Access)) {
        throw new ErrorMessage("You do not have access to this game");
      }

      if (user.arenaTokens < 1) {
        throw new ErrorMessage("You do not have enough arena tokens");
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

      return { id: game.id, gameName };
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access attempt to initialize game");
      throw error;
    }

    if (error instanceof ErrorMessage) {
      throw error;
    }

    logger.error("Error initializing game: " + error);
    throw new Error(
      "Error initializing game. Please inform a game master of this timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

export const startGame = async (gameId: string) => {
  try {
    await checkActiveUserAuth();
    return await prisma.$transaction(async (db) => {
      const game = await db.game.update({
        where: { id: gameId, status: "PENDING" },
        data: { status: "INPROGRESS", startedAt: new Date() },
      });
      if (!game) {
        throw new ErrorMessage("Invalid game session");
      }
      return "Game started successfully";
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access attempt to start game");
      throw error;
    }

    if (error instanceof ErrorMessage) {
      throw error;
    }

    logger.error("Error starting game: " + error);
    throw new Error(
      "Error starting game. Please inform a game master of this timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

export const updateGame = async (
  gameId: string,
  charIndex: number,
  mistakes: number,
) => {
  try {
    const session = await checkActiveUserAuth();

    return await prisma.$transaction(async (db) => {
      const game = await db.game.findUnique({
        where: { id: gameId },
      });

      if (
        !game ||
        game.userId !== session.user.id ||
        game.status !== "INPROGRESS"
      ) {
        logger.info("Invalid game session for user: " + session.user.id);
        throw new ErrorMessage("Invalid game state");
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
      // TODO: consider checking for unrealistic mistakes to invalidate game
      if (charIndex > 800 || wpm > 135) {
        await db.game.delete({
          where: { id: gameId, status: "INPROGRESS" },
        });
        logger.warn(
          "Invalid game state, game aborted for user: " +
            session.user.id +
            ". Game data (Charindex and wpm): " +
            charIndex +
            wpm,
        );
        throw new ErrorMessage("Invalid game state, game aborted");
      }

      const mistakePenalty = 1 - mistakes / (charIndex + 1);
      const score = Math.floor(cpm * 2 * mistakePenalty);
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
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access attempt to update game");
      throw error;
    }

    if (error instanceof ErrorMessage) {
      throw error;
    }

    logger.error("Error updating game: " + error);
    throw new Error(
      "Error updating game. Please inform a game master of this timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

export const finishGame = async (gameId: string) => {
  try {
    const session = await checkActiveUserAuth();

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
        logger.info("Invalid game session for user: " + session.user.id);
        throw new ErrorMessage("Invalid game state");
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

      await addAnalytics(db, game.userId, "game_completion", {
        gameId: game.id,
        category: game.game,
        goldChange: gold,
      });

      return { message: "Recieved " + gold + " gold", gold };
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access attempt to finish game");
      throw error;
    }

    if (error instanceof ErrorMessage) {
      throw error;
    }

    logger.error("Error finishing up game: " + error);
    throw new Error(
      "Something went wrong. Please inform a game master of this timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

export const getRandomTypeQuestText = async () => {
  try {
    await checkActiveUserAuth();

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
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access attempt to get random TypeQuest text");
      throw error;
    }

    logger.error("Error fetching random TypeQuest text: " + error);
    throw new Error(
      "Error fetching random TypeQuest text. Please inform a game master of this timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

export const getGameLeaderboard = async (gameName: string) => {
  try {
    await checkActiveUserAuth();

    const leaderboard = await prisma.game.findMany({
      where: {
        game: gameName,
        status: "FINISHED",
        user: { publicHighscore: true },
      },
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
      distinct: ["userId"],
      take: 10,
    });

    return leaderboard;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access attempt to get game leaderboard");
      throw error;
    }
    logger.error("Error fetching game leaderboard: " + error);

    throw new Error(
      "Error fetching leaderboard. Please inform a game master of this timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};
