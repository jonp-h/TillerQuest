import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";

export const getDeadUserCount = [
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const deadUserCount = await db.user.count({
        where: {
          hp: {
            equals: 0,
          },
        },
      });

      res.json({ success: true, data: deadUserCount });
    } catch (error) {
      logger.error("Error fetching dead user count: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch dead user count",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
