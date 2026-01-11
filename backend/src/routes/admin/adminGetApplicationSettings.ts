import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAuth, requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";

export const adminGetApplicationSettings = [
  requireAuth,
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const sessionUserId = req.session!.user.id;

      if (!sessionUserId) {
        res.status(401).json({
          success: false,
          error: "User not authenticated",
        });
        return;
      }

      const applicationSettings = await db.applicationSettings.findMany({
        orderBy: { key: "asc" },
      });

      res.json({ success: true, data: applicationSettings });
    } catch (error) {
      logger.error("Error fetching application settings: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch application settings",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
