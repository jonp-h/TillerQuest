import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAuth, requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";

export const adminGetSpecialStatuses = [
  requireAuth,
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const specialReqs = await db.shopItem.findMany({
        where: {
          specialReq: {
            not: null,
          },
        },
        select: {
          specialReq: true,
        },
      });

      res.json({ success: true, data: specialReqs });
    } catch (error) {
      logger.error("Error fetching special statuses: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch special statuses",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
