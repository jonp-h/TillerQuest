import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireActiveUser } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";

export const getDeadUsers = [
  requireActiveUser,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const deadUsers = await db.user.findMany({
        where: {
          hp: {
            equals: 0,
          },
        },

        select: {
          id: true,
          username: true,
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
