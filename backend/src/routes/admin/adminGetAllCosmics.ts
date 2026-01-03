import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAuth, requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";

export const adminGetAllCosmics = [
  requireAuth,
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const cosmicEvents = await db.cosmicEvent.findMany({
        orderBy: [{ selectedForVg1: "desc" }, { selectedForVg2: "desc" }],
      });

      res.json({ success: true, data: cosmicEvents });
    } catch (error) {
      logger.error("Error fetching cosmic events: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch cosmic events",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
