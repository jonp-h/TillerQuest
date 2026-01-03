import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAuth, requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";

export const adminGetRecommendedCosmic = [
  requireAuth,
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const recommendedCosmic = await db.cosmicEvent.findFirst({
        where: {
          recommended: true,
        },
      });

      res.json({ success: true, data: recommendedCosmic });
    } catch (error) {
      logger.error("Error fetching recommended cosmic event: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch recommended cosmic event",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
