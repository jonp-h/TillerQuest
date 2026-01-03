import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAuth, requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";

export const getTotalUserCount = [
  requireAuth,
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const totalUserCount = await db.user.count();

      res.json({ success: true, data: totalUserCount });
    } catch (error) {
      logger.error("Error fetching total user count: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch total user count",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
