"use server";
/* eslint-disable @typescript-eslint/no-explicit-any */

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
import { $Enums, Game } from "@prisma/client";
import { addAnalytics } from "../analytics/analytics";
import { PrismaTransaction } from "@/types/prismaTransaction";

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
  data: number[],
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

      let score = game.score;
      let metadata: Record<string, any> = {};

      switch (game.game) {
        case "TypeQuest":
          ({ score, metadata } = await updateTypeQuestGame(
            db,
            session,
            score,
            metadata,
            game,
            data[0],
            mistakes,
          ));
          break;
        case "WordQuest":
          ({ score, metadata } = await updateWordQuestGame(
            db,
            session,
            score,
            metadata,
            game,
            data,
          ));
          break;
      }

      await db.game.update({
        where: { id: gameId },
        data: { score, metadata },
      });
      return { score, metadata };
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
        `GAME: ${targetUser.username} finished a game of ${game.game}, and recieved ${gold} gold`,
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

// -------- TypeQuest specific functions --------

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

const updateTypeQuestGame = async (
  db: PrismaTransaction,
  session: { user: { id: string } },
  score: number,
  metadata: Record<string, any>,
  game: Game,
  charIndex: number,
  mistakes: number,
) => {
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
      where: { id: game.id, status: "INPROGRESS" },
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
  score = Math.floor(cpm * 2 * mistakePenalty);
  const totalCharacters = charIndex;

  metadata = {
    wpm,
    cpm,
    totalCharacters,
    mistakes,
  };
  return { score, metadata };
};

// -------- WordQuest specific functions --------

export const getRandomWordQuestBoard = async (gameId: string) => {
  try {
    await checkActiveUserAuth();

    // First check if the game already has board data
    const existingGame = await prisma.game.findUnique({
      where: { id: gameId },
      select: { status: true, metadata: true },
    });

    if (!existingGame) {
      throw new ErrorMessage("Game not found");
    }

    // If game is already in progress and has metadata, return existing board
    if (existingGame.status === "INPROGRESS" && existingGame.metadata) {
      const metadata =
        typeof existingGame.metadata === "string"
          ? JSON.parse(existingGame.metadata)
          : existingGame.metadata;

      if (metadata.board && metadata.words) {
        // Reconstruct board from stored string
        const boardArray = [];
        for (let i = 0; i < 16; i++) {
          boardArray.push(metadata.board.slice(i * 16, (i + 1) * 16).split(""));
        }

        // Get current game state including score
        const currentGame = await prisma.game.findUnique({
          where: { id: gameId },
          select: { score: true },
        });

        return {
          board: boardArray,
          words: metadata.words.map((w: any) => w.word),
          foundWords: metadata.foundWords || [],
          score: currentGame?.score || 0,
          hintPenalties: metadata.hintPenalties || 0,
        };
      }
    }

    // If game is pending, initialize it
    if (existingGame.status !== "PENDING") {
      throw new ErrorMessage("Game is not in a valid state to initialize");
    }

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    // Create a 16x16 board filled with random letters
    const board = Array.from({ length: 16 }, () =>
      Array.from({ length: 16 }, () =>
        letters.charAt(Math.floor(Math.random() * letters.length)),
      ),
    );

    const words = await prisma.wordQuestWord.findMany({
      select: {
        word: true,
      },
    });

    if (words.length === 0) {
      throw new ErrorMessage("No words available for WordQuest");
    }

    // Select 5-8 random words for the game
    const selectedWords = [];
    const wordCount = Math.min(8, words.length);
    const usedIndices = new Set<number>();

    while (
      selectedWords.length < wordCount &&
      usedIndices.size < words.length
    ) {
      const idx = Math.floor(Math.random() * words.length);
      if (!usedIndices.has(idx)) {
        usedIndices.add(idx);
        selectedWords.push(words[idx]);
      }
    }

    const placedWords: Array<{
      word: string;
      indices: number[];
    }> = [];

    // Simple word placement - try to place each word
    for (const wordObj of selectedWords) {
      const word = wordObj.word.toUpperCase();
      let placed = false;

      // Try 50 times to place this word
      for (let attempt = 0; attempt < 50 && !placed; attempt++) {
        // Choose random direction: horizontal, vertical, or diagonal
        const directions = [
          { dx: 1, dy: 0 }, // horizontal right
          { dx: 0, dy: 1 }, // vertical down
          { dx: 1, dy: 1 }, // diagonal down-right
          { dx: -1, dy: 1 }, // diagonal down-left
        ];

        const direction =
          directions[Math.floor(Math.random() * directions.length)];

        // Calculate valid start positions
        const maxRow = direction.dy <= 0 ? 15 : 15 - (word.length - 1);
        const maxCol = direction.dx <= 0 ? 15 : 15 - (word.length - 1);
        const minRow = direction.dy >= 0 ? 0 : word.length - 1;
        const minCol = direction.dx >= 0 ? 0 : word.length - 1;

        const startRow =
          Math.floor(Math.random() * (maxRow - minRow + 1)) + minRow;
        const startCol =
          Math.floor(Math.random() * (maxCol - minCol + 1)) + minCol;

        // Check if word can be placed here
        const wordIndices: number[] = [];
        let canPlace = true;

        for (let i = 0; i < word.length; i++) {
          const row = startRow + direction.dy * i;
          const col = startCol + direction.dx * i;

          if (row < 0 || row >= 16 || col < 0 || col >= 16) {
            canPlace = false;
            break;
          }

          wordIndices.push(row * 16 + col);
        }

        // Check for conflicts with already placed words
        if (canPlace) {
          const hasConflict = placedWords.some((placedWord) =>
            placedWord.indices.some((index) => wordIndices.includes(index)),
          );

          if (!hasConflict) {
            // Place the word
            for (let i = 0; i < word.length; i++) {
              const row = startRow + direction.dy * i;
              const col = startCol + direction.dx * i;
              board[row][col] = word[i];
            }

            placedWords.push({
              word: word,
              indices: wordIndices,
            });

            placed = true;
          }
        }
      }
    }

    await prisma.game.update({
      where: { id: gameId, status: "PENDING" },
      data: {
        status: "INPROGRESS",
        startedAt: new Date(),
        metadata: {
          board: board.flat().join(""),
          words: placedWords.map((pw) => ({
            word: pw.word,
            indices: pw.indices,
          })),
          foundWords: [],
          hintPenalties: 0, // Initialize hint penalties
        },
      },
    });

    return {
      board,
      words: placedWords.map((w) => w.word),
      foundWords: [],
      score: 0,
      hintPenalties: 0,
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access attempt to get random WordQuest board");
      throw error;
    }

    logger.error("Error fetching random WordQuest board: " + error);
    throw new Error(
      "Error fetching random WordQuest board. Please inform a game master of this timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

const updateWordQuestGame = async (
  db: PrismaTransaction,
  session: { user: { id: string } },
  score: number,
  metadata: Record<string, any>,
  game: Game,
  data: number[],
) => {
  // Use the game's existing metadata, not the empty metadata parameter
  let metadataObj: any = game.metadata;
  if (typeof metadataObj === "string") {
    try {
      metadataObj = JSON.parse(metadataObj);
    } catch {
      metadataObj = {};
    }
  }

  const words = metadataObj?.words ?? [];
  const foundWords: string[] = metadataObj?.foundWords ?? [];
  const hintPenalties = metadataObj?.hintPenalties ?? 0; // Track total hint penalties

  // Check if the selected indices match any word
  for (const wordObj of words) {
    const wordIndices = wordObj.indices;

    // Sort both arrays to compare regardless of selection order
    const sortedWordIndices = [...wordIndices].sort((a, b) => a - b);
    const sortedDataIndices = [...data].sort((a, b) => a - b);

    // Check if arrays are equal
    if (
      sortedWordIndices.length === sortedDataIndices.length &&
      sortedWordIndices.every((idx, i) => idx === sortedDataIndices[i])
    ) {
      // Only add if not already found
      if (!foundWords.includes(wordObj.word)) {
        foundWords.push(wordObj.word);
      }
      break;
    }
  }

  // Calculate total score: 100 points per found word minus hint penalties
  score = foundWords.length * 100 - hintPenalties;

  // Return the updated metadata with all existing data preserved
  metadata = { ...metadataObj, foundWords, hintPenalties };

  return { score, metadata };
};

export const getWordQuestHint = async (gameId: string, word: string) => {
  try {
    await checkActiveUserAuth();

    const game = await prisma.game.findUnique({
      where: { id: gameId, status: "INPROGRESS" },
      select: {
        metadata: true,
        score: true,
      },
    });

    if (!game || !game.metadata) {
      throw new ErrorMessage("Invalid game state");
    }

    const metadata =
      typeof game.metadata === "string"
        ? JSON.parse(game.metadata)
        : game.metadata;

    const words = metadata?.words || [];
    const foundWords = metadata?.foundWords || [];
    const currentHintPenalties = metadata?.hintPenalties || 0;

    const wordObj = words.find(
      (w: any) => w.word.toLowerCase() === word.toLowerCase(),
    );

    if (!wordObj) {
      throw new ErrorMessage("Word not found in the current game");
    }

    // Add 50 to hint penalties and recalculate score
    const newHintPenalties = currentHintPenalties + 50;
    const newScore = foundWords.length * 100 - newHintPenalties;

    // Update game with new metadata and score
    await prisma.game.update({
      where: { id: gameId },
      data: {
        score: newScore,
        metadata: {
          ...metadata,
          hintPenalties: newHintPenalties,
        },
      },
    });

    return { score: newScore, index: wordObj.indices[0] };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access attempt to get WordQuest hint");
      throw error;
    }

    if (error instanceof ErrorMessage) {
      throw error;
    }

    logger.error("Error fetching WordQuest hint: " + error);
    throw new Error(
      "Error fetching WordQuest hint. Please inform a game master of this timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};
