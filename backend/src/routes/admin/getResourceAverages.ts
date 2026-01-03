import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAuth, requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";

export const getResourceAverages = [
  requireAuth,
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userAverages = await db.user.aggregate({
        _avg: {
          hp: true,
          mana: true,
          xp: true,
          gold: true,
        },
        where: {
          role: "USER",
        },
      });

      const guildAverages = await db.user.groupBy({
        by: ["guildName"],
        _avg: {
          hp: true,
          mana: true,
          xp: true,
          gold: true,
        },
        where: {
          role: "USER",
          guildName: { not: null },
          guild: {
            archived: false, // Only include guilds that are not archived
          },
        },
      });

      const classAverages = await db.user.groupBy({
        by: ["class"],
        _avg: {
          hp: true,
          mana: true,
          xp: true,
          gold: true,
        },
        where: {
          role: "USER",
          class: { not: null },
        },
      });

      res.json({
        success: true,
        data: {
          overall: userAverages,
          byGuild: guildAverages,
          byClass: classAverages,
        },
      });
    } catch (error) {
      logger.error("Error fetching resource averages: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch resource averages",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
