import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireActiveUser } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";

export const getBadgeItems = [
  requireActiveUser,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const items = await db.shopItem.findMany({
        where: { type: "Badge" },
        orderBy: [{ rarity: "asc" }, { price: "asc" }, { levelReq: "asc" }],
      });

      res.json({ success: true, data: items });
    } catch (error) {
      logger.error("Error fetching badge items: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch badge items",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
