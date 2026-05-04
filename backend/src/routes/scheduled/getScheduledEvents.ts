import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireActiveUser } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";

export const getScheduledEvents = [
  requireActiveUser,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const now = new Date();
      // Get start of today (midnight) to include all wishes scheduled for today and future
      const startOfToday = now;
      startOfToday.setHours(0, 0, 0, 0);

      const wishes = await db.wish.count({
        where: { scheduled: { gte: startOfToday } },
      });

      const appEvents = await db.app.findFirst({
        where: { scheduled: { gte: now } },
        orderBy: { scheduled: "asc" },
        select: {
          scheduled: true,
        },
      });

      res.json({ success: true, data: { wishes, appEvents } });
    } catch (error) {
      logger.error("Error fetching scheduled events:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch scheduled events",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
