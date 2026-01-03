import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import {
  requireAuth,
  requireActiveUser,
} from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";

export const getValhallaUsers = [
  requireAuth,
  requireActiveUser,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const users = await db.user.findMany({
        where: {
          publicHighscore: true,
          archiveConsent: true,
          // inventory: {
          //   some: {
          //     name: {
          //       in: ["Demi-god"],
          //     },
          //   },
          // },
          xp: {
            gte: 50000,
          },
        },
        orderBy: { xp: "desc" },
        select: {
          xp: true,
          title: true,
          titleRarity: true,
          name: true,
          username: true,
          lastname: true,
          image: true,
          level: true,
          class: true,
          guildName: true,
          schoolClass: true,
        },
      });

      res.json({ success: true, data: users });
    } catch (error) {
      logger.error("Error fetching valhalla users: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch valhalla users",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
