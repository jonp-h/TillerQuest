import { Response } from "express";
import { logger } from "../../lib/logger.js";
import { requireAuth, requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import { db } from "lib/db.js";

export const adminPendingImagesCount = [
  requireAuth,
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const count = await db.imageUpload.count({
        where: {
          status: "PENDING",
        },
      });

      res.json({ success: true, data: count ?? 0 });
    } catch (error) {
      logger.error("Error counting pending images: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to count pending images",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
