import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import {
  requireAuth,
  requireActiveUser,
} from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";

export const getDeadUsers = [
  requireAuth,
  requireActiveUser,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const deadUsers = await db.user.findMany({
        where: {
          hp: {
            equals: 0,
          },
        },
      });

      res.json({ success: true, data: deadUsers });
    } catch (error) {
      logger.error("Error fetching dead users: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch dead users",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
