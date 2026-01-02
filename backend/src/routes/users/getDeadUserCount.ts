import { Request, Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAuth, requireAdmin } from "../../middleware/authMiddleware.js";

export const getDeadUserCount = [
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response) => {
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
