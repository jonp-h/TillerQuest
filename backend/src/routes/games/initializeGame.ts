import { Response } from "express";
import { $Enums, db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireUserIdAndActive } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";
import {
  validateBody,
  validateParams,
} from "middleware/validationMiddleware.js";
import { ErrorMessage } from "lib/error.js";
import {
  gameNameSchema,
  userIdParamSchema,
} from "utils/validators/validationUtils.js";

export const initializeGame = [
  requireUserIdAndActive(),
  validateParams(userIdParamSchema),
  validateBody(gameNameSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.params.userId;
      const gameName = req.body.gameName as string;

      await db.$transaction(async (tx) => {
        const user = await tx.user.findUnique({
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

        await tx.user.update({
          where: { id: user.id },
          data: { arenaTokens: { decrement: 1 } },
        });

        const game = await tx.game.create({
          data: {
            userId: user.id,
            game: gameName,
          },
        });

        res.json({ success: true, data: { id: game.id, gameName: game.game } });
      });
    } catch (error) {
      if (error instanceof ErrorMessage) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
        return;
      }
      logger.error("Error initializing game: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to initialize game",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
