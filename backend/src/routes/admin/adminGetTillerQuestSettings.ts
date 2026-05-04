import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";

export const adminGetTillerQuestSettings = [
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

      const tillerQuestSettings = await db.tillerQuestSettings.findMany({
        orderBy: { key: "asc" },
      });

      res.json({ success: true, data: tillerQuestSettings });
    } catch (error) {
      logger.error("Error fetching tiller quest settings: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch tiller quest settings",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
