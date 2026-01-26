import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireActiveUser } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";

export const getScheduledWishesCount = [
  requireActiveUser,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Get start of today (midnight) to include all wishes scheduled for today and future
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const wishes = await db.wish.count({
        where: { scheduled: { gte: startOfToday } },
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
