import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import {
  requireAuth,
  requireActiveUser,
} from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";
import { validateParams } from "middleware/validationMiddleware.js";
import { gameNameSchema } from "utils/validators/validationUtils.js";

export const getGameLeaderboard = [
  requireAuth,
  requireActiveUser,
  validateParams(gameNameSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const gameName = req.params.gameName;

      const leaderboard = await db.game.findMany({
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
              titleRarity: true,
            },
          },
        },
        orderBy: {
          score: "desc",
        },
        distinct: ["userId"],
        take: 10,
      });

      res.json({ success: true, data: leaderboard });
    } catch (error) {
      logger.error("Error fetching game leaderboard: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch game leaderboard",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
