import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import {
  requireAuth,
  requireActiveUser,
} from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";

export const getScheduledWishesCount = [
  requireAuth,
  requireActiveUser,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const wishes = await db.wish.count({
        where: { scheduled: { gt: new Date() } },
      });

      res.json({ success: true, data: wishes });
    } catch (error) {
      logger.error("Error fetching wishes:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch wishes",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
