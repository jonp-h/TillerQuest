import { Request, Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import {
  requireActiveUser,
  requireAuth,
} from "../../middleware/authMiddleware.js";

export const getBadgeItems = [
  requireAuth,
  requireActiveUser,
  async (req: Request, res: Response) => {
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
