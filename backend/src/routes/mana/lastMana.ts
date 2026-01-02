import { Request, Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import {
  requireAuth,
  requireUserIdAndActive,
} from "../../middleware/authMiddleware.js";

export const getLastMana = [
  requireAuth,
  requireUserIdAndActive(),
  async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      const user = await db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          lastMana: true,
        },
      });

      res.json({ success: true, data: user });
    } catch (error) {
      logger.error("Error fetching last mana by ID: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch last mana",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
