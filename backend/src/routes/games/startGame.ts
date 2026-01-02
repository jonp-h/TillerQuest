import { Response } from "express";
import { $Enums, db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireUserIdAndActive } from "../../middleware/authMiddleware.js";
import z from "zod";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";
import { validateBody } from "middleware/validationMiddleware.js";
import { ErrorMessage } from "lib/error.js";

export const initializeGameSchema = z.object({
  gameName: z.enum(["TypeQuest", "WordQuest", "BinaryJack"]),
});

export const initializeGame = [
  requireUserIdAndActive(),
  validateBody(initializeGameSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const gameId = req.params.gameId;
      const userId = req.session?.user.id;

      await db.$transaction(async (db) => {
        const game = await db.game.update({
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
        return res.status(400).json({
          success: false,
          error: error.message,
        });
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
