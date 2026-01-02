import { Request, Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import {
  requireAuth,
  requireActiveUser,
} from "../../middleware/authMiddleware.js";

export const getGameUser = [
  requireAuth,
  requireActiveUser,
  async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      const user = await db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          arenaTokens: true,
          access: true,
          gold: true,
        },
      });

      res.json({ success: true, data: user });
    } catch (error) {
      logger.error("Error fetching game user by ID: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch user",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
