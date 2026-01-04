import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import {
  requireAuth,
  requireUsernameAndActive,
} from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";

export const getUserSettings = [
  requireAuth,
  requireUsernameAndActive(),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const username = req.params.username;

      const user = await db.user.findUnique({
        where: { username },
        select: {
          id: true,
          username: true,
          publicHighscore: true,
          archiveConsent: true,
        },
      });

      res.json({ success: true, data: user });
    } catch (error) {
      logger.error("Error fetching user settings by username: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch user settings",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
