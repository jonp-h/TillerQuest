import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireUserIdAndActive } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";

export const getGuildEnemiesByUserId = [
  requireUserIdAndActive(),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.params.userId;

      const enemies = await db.guildEnemy.findMany({
        where: {
          guild: {
            members: {
              some: { id: userId },
            },
          },
        },
        select: {
          id: true,
          icon: true,
          maxHealth: true,
          enemyId: true,
          attack: true,
          guildName: true,
          health: true,
          name: true,
        },
        orderBy: {
          id: "asc",
        },
      });

      res.json({ success: true, data: enemies });
    } catch (error) {
      logger.error("Error fetching guild enemies: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch enemies",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
