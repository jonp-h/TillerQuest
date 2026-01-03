import { Response } from "express";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireUserIdAndActive } from "../../middleware/authMiddleware.js";

export const getNotifications = [
  requireUserIdAndActive(),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.session!.user.id;

      const logs = await db.systemMessage.findMany({
        where: {
          readers: {
            none: {
              id: userId,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      res.json({ success: true, data: logs });
    } catch (error) {
      logger.error("Error fetching notifications: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch notifications",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
