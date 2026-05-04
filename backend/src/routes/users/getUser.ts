import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireActiveUser } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";

export const getUser = [
  requireActiveUser,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.session!.user.id;
      const user = await db.user.findUnique({
        where: { id: userId },
        select: {
          username: true,
          name: true,
          role: true,
          image: true,
          level: true,
          xp: true,
          arenaTokens: true,
          diceColorset: true,
          access: true,
          gold: true,
        },
      });

      res.json({ success: true, data: { userId, ...user } });
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
