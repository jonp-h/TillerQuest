import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireActiveUser } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import { validateParams } from "../../middleware/validationMiddleware.js";
import { gameNameSchema } from "../../utils/validators/validationUtils.js";

export const getGameLeaderboard = [
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
      // internal anti-cheat tracking fields, not meant for display
      const HIDDEN_METADATA_KEYS = [
        "lastUpdateAt",
        "speedHistory",
        "lastCharIndex",
      ];

      res.json({
        success: true,
        data: leaderboard.map((entry) => ({
          ...entry,
          metadata:
            entry.metadata !== null &&
            typeof entry.metadata === "object" &&
            !Array.isArray(entry.metadata)
              ? Object.fromEntries(
                  Object.entries(entry.metadata).filter(
                    ([key]) => !HIDDEN_METADATA_KEYS.includes(key),
                  ),
                )
              : entry.metadata,
        })),
      });
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
