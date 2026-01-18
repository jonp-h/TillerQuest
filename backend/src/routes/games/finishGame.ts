import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireActiveUser } from "../../middleware/authMiddleware.js";
import z from "zod";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";
import { ErrorMessage } from "lib/error.js";
import { addLog } from "utils/logs/addLog.js";
import { goldValidator } from "utils/abilities/abilityValidators.js";
import { addAnalytics } from "utils/analytics/addAnalytics.js";
import { validateParams } from "middleware/validationMiddleware.js";
import { gameIdParamSchema } from "utils/validators/validationUtils.js";

export const finishGameSchema = z.object({
  gameName: z.enum(["TypeQuest", "WordQuest", "BinaryJack"]),
});

export const finishGame = [
  requireActiveUser,
  validateParams(gameIdParamSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const gameId = req.params.gameId;
      const userId = req.session!.user.id;

      return await db.$transaction(async (tx) => {
        const game = await tx.game.findUnique({
          where: { id: gameId },
          include: { user: { select: { id: true, gold: true } } },
        });

        if (!game || game.userId !== userId || game.status !== "INPROGRESS") {
          logger.info("Invalid game session for user: " + userId);
          throw new ErrorMessage("Invalid game state");
        }

        let gold = 0;
        let message = "";

        // Handle BinaryJack wagering system
        if (game.game === "BinaryJack") {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let metadata: any = game.metadata || {};
          if (typeof metadata === "string") {
            try {
              metadata = JSON.parse(metadata);
            } catch {
              metadata = {};
            }
          }

          const stake = game.score; // the stake is stored in the score field
          const targetNumber = metadata.targetNumber;
          const currentValue = metadata.currentValue;

          if (currentValue === targetNumber) {
            // Player won - return double the stake. No need to add additional passive multiplies with goldValidator
            gold = stake * 2;
            message = `🎉 Target hit! Won ${gold} gold (doubled your ${stake} stake)`;
          } else {
            // Player lost - they already lost their stake when game started
            gold = 0;
            message = `💀 Game over. You lost your ${stake} gold stake. Perhaps you should practice some binary operations? 🤡`;
          }
        } else {
          // For other games, use the existing gold validation system
          gold = await goldValidator(tx, game.userId, game.score);
          gold = gold < 0 ? 0 : gold; // Ensure gold is non-negative
          message = "Received " + gold + " gold";
        }

        const targetUser = await tx.user.update({
          where: { id: game.userId },
          data: { gold: { increment: gold } },
          select: {
            username: true,
          },
        });

        await tx.game.update({
          where: { id: gameId },
          data: { status: "FINISHED" },
        });

        await addLog(
          tx,
          game.userId,
          `GAME: ${targetUser.username} finished a game of ${game.game}, and received ${gold} gold`,
        );

        await addAnalytics(
          tx,
          game.userId,
          req.session!.user.role,
          "game_completion",
          {
            gameId: game.id,
            category: game.game,
            goldChange: gold,
          },
        );

        res.json({ success: true, data: { message: message, gold: gold } });
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
