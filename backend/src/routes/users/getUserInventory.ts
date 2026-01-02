import { Request, Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import {
  requireAuth,
  requireUserIdAndActive,
} from "../../middleware/authMiddleware.js";

export const getUserInventory = [
  requireAuth,
  requireUserIdAndActive(),
  async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;

      const inventory = await db.user.findFirst({
        where: { id: userId },
        select: {
          id: true,
          title: true,
          class: true,
          gold: true,
          level: true,
          inventory: true,
          special: true,
        },
      });

      res.json({ success: true, data: inventory });
    } catch (error) {
      logger.error("Error fetching user inventory by userId: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch user inventory",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
