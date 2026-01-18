import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";

export const adminGetDungeonInfo = [
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const dungeons = await db.guild.findMany({
        select: {
          name: true,
          enemies: {
            select: {
              id: true,
              health: true,
              name: true,
              icon: true,
              attack: true,
              xp: true,
              gold: true,
            },
          },
        },
      });

      res.json({ success: true, data: dungeons });
    } catch (error) {
      logger.error("Error fetching dungeon info: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch dungeon info",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
