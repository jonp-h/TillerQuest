import { Response } from "express";
import { logger } from "../../lib/logger.js";
import {
  requireActiveUser,
  requireAuth,
} from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";
import { db } from "lib/db.js";

// get guild member count of all guilds, excluding the current user in the count and only returning guilds that are not archived
export const getGuildLeaderboard = [
  requireAuth,
  requireActiveUser,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const guild = await db.guild.findMany({
        where: {
          archived: false,
          members: {
            some: {
              id: {
                not: "",
              },
            },
          },
        },
        select: {
          name: true,
          schoolClass: true,
          guildLeader: true,
          level: true,
          icon: true,
          members: {
            select: {
              id: true,
              username: true,
              xp: true,
            },
          },
        },
        orderBy: [{ level: "desc" }, { name: "asc" }],
      });

      res.json({ success: true, data: guild });
    } catch (error) {
      logger.error("Error fetching guild leaderboard: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch guild leaderboard",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
