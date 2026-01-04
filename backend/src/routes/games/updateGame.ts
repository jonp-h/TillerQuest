import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireUserIdAndActive } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";
import {
  validateBody,
  validateParams,
} from "middleware/validationMiddleware.js";
import { ErrorMessage } from "lib/error.js";
import { updateTypeQuestGame } from "utils/games/typeQuest.js";
import { updateWordQuestGame } from "utils/games/wordQuest.js";
import {
  gameIdParamSchema,
  updateGameSchema,
} from "utils/validators/validationUtils.js";

interface UpdateGameRequest extends AuthenticatedRequest {
  body: {
    data: number[];
    mistakes?: number;
  };
}

export const updateGame = [
  requireUserIdAndActive(),
  validateParams(gameIdParamSchema),
  validateBody(updateGameSchema),
  async (req: UpdateGameRequest, res: Response) => {
    try {
      const gameId = req.params.gameId;
      const { data, mistakes } = req.body;
      const userId = req.session!.user.id;

      await db.$transaction(async (tx) => {
        const game = await tx.game.findUnique({
          where: { id: gameId, userId: userId },
        });

        if (!game || game.userId !== userId || game.status !== "INPROGRESS") {
          logger.info("Invalid game session for user: " + userId);
          throw new ErrorMessage("Invalid game state");
        }

        let score = game.score;
        let metadata: Record<string, any> = {};

        switch (game.game) {
          case "TypeQuest":
            ({ score, metadata } = await updateTypeQuestGame(
              tx,
              userId,
              score,
              metadata,
              game,
              data[0],
              mistakes!,
            ));
            break;
          case "WordQuest":
            ({ score, metadata } = await updateWordQuestGame(
              tx,
              userId,
              score,
              metadata,
              game,
              data,
            ));
            break;
          case "BinaryJack":
            // BinaryJack uses its own dedicated functions (rollBinaryJackDice, applyBinaryOperation)
            // This case shouldn't be reached in normal gameplay
            break;
        }

        await tx.game.update({
          where: { id: gameId },
          data: { score, metadata },
        });

        res.json({ success: true, data: "Game started successfully" });
      });
    } catch (error) {
      if (error instanceof ErrorMessage) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
        return;
      }
      logger.error("Error starting game: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to start game",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
