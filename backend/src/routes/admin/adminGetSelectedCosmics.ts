import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";

export const adminGetSelectedCosmics = [
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const [vg1, vg2] = await Promise.all([
        db.cosmicEvent.findFirst({
          where: {
            selectedForVg1: true,
          },
        }),
        db.cosmicEvent.findFirst({
          where: {
            selectedForVg2: true,
          },
        }),
      ]);

      res.json({ success: true, data: { vg1, vg2 } });
    } catch (error) {
      logger.error("Error fetching selected cosmic events: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch selected cosmic events",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
