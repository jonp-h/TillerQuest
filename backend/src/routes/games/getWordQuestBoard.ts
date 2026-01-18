import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireActiveUser } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import { ErrorMessage } from "../../lib/error.js";
import { validateParams } from "middleware/validationMiddleware.js";
import { gameIdParamSchema } from "utils/validators/validationUtils.js";

export const getWordQuestBoard = [
  requireActiveUser,
  validateParams(gameIdParamSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const gameId = req.params.gameId;

      // First check if the game already has board data
      const existingGame = await db.game.findUnique({
        where: { id: gameId },
        select: { status: true, metadata: true },
      });

      if (!existingGame) {
        res.status(404).json({
          success: false,
          error: "Game not found",
        });
        return;
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
            boardArray.push(
              metadata.board.slice(i * 16, (i + 1) * 16).split(""),
            );
          }

          // Get current game state including score
          const currentGame = await db.game.findUnique({
            where: { id: gameId },
            select: { score: true },
          });

          res.json({
            success: true,
            data: {
              board: boardArray,
              words: metadata.words.map((w: { word: string }) => w.word),
              foundWords: metadata.foundWords || [],
              score: currentGame?.score || 0,
              hintPenalties: metadata.hintPenalties || 0,
            },
          });
          return;
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

      const words = await db.wordQuestWord.findMany({
        select: {
          word: true,
        },
      });

      if (words.length === 0) {
        res.status(500).json({
          success: false,
          error: "No words available for WordQuest",
        });
        return;
      }

      // Select 5-10 random words for the game
      const selectedWords = [];
      const wordCount = 10;
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

      await db.game.update({
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

      res.json({
        success: true,
        data: {
          board,
          words: placedWords.map((w) => w.word),
          foundWords: [],
          score: 0,
          hintPenalties: 0,
        },
      });
    } catch (error) {
      if (error instanceof ErrorMessage) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
        return;
      }

      logger.error("Error fetching WordQuest board: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch WordQuest board",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
