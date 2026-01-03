import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import {
  requireAuth,
  requireActiveUser,
} from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import { ErrorMessage } from "../../lib/error.js";
import z from "zod";
import {
  validateBody,
  validateParams,
} from "../../middleware/validationMiddleware.js";
import {
  gameIdParamSchema,
  wordQuestHintSchema,
} from "utils/validators/validationUtils.js";

interface WordQuestHintRequest extends AuthenticatedRequest {
  body: {
    word: string;
  };
}

export const getWordQuestHint = [
  requireAuth,
  requireActiveUser,
  validateParams(gameIdParamSchema),
  validateBody(wordQuestHintSchema),
  async (req: WordQuestHintRequest, res: Response) => {
    try {
      const gameId = req.params.gameId;
      const { word } = req.body;

      const game = await db.game.findUnique({
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
        res.status(404).json({
          success: false,
          error: "Word not found in the current game",
        });
        return;
      }

      // Add 30 to hint penalties and recalculate score
      const newHintPenalties = currentHintPenalties + 30;
      const newScore = foundWords.length * 65 - newHintPenalties;

      // Update game with new metadata and score
      await db.game.update({
        where: { id: gameId },
        data: {
          score: newScore,
          metadata: {
            ...metadata,
            hintPenalties: newHintPenalties,
          },
        },
      });

      res.json({
        success: true,
        data: {
          score: newScore,
          index: wordObj.indices[0],
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

      logger.error("Error fetching WordQuest hint: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch WordQuest hint",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
