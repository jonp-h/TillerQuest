import { Request, Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import {
  requireActiveUser,
  requireAuth,
} from "../../middleware/authMiddleware.js";

/**
 * Get all guilds with their members for admin view.
 * Includes archived guilds.
 */
export const getGuilds = [
  requireAuth,
  requireActiveUser,
  async (req: Request, res: Response) => {
    try {
      const guilds = await db.guild.findMany({
        select: {
          name: true,
          schoolClass: true,
          archived: true,
          guildLeader: true,
          nextGuildLeader: true,
          members: {
            select: {
              id: true,
              name: true,
              lastname: true,
              schoolClass: true,
            },
          },
        },
        orderBy: [{ archived: "asc" }, { schoolClass: "asc" }, { name: "asc" }],
      });

      res.json({ success: true, data: guilds });
    } catch (error) {
      logger.error("Error fetching guilds: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch guilds",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
