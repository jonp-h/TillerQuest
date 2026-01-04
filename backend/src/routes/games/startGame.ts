import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireUserIdAndActive } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";
import { ErrorMessage } from "lib/error.js";
import { validateParams } from "middleware/validationMiddleware.js";
import { gameIdParamSchema } from "utils/validators/validationUtils.js";

export const startGame = [
  requireUserIdAndActive(),
  validateParams(gameIdParamSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const gameId = req.params.gameId;
      const userId = req.session?.user.id;

      await db.$transaction(async (tx) => {
        const game = await tx.game.update({
          where: { id: gameId, userId: userId, status: "PENDING" },
          data: { status: "INPROGRESS", startedAt: new Date() },
        });
        if (!game) {
          throw new ErrorMessage("Invalid game session");
        }

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
