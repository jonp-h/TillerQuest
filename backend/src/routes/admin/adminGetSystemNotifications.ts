import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";

export const adminGetSystemNotifications = [
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const readCounts = await db.notification.findMany({
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
          _count: {
            select: { readers: true },
          },
        },
      });

      const notifications = readCounts.map((message) => ({
        id: message.id,
        title: message.title,
        content: message.content,
        createdAt: message.createdAt,
        readCount: message._count.readers,
      }));

      res.json({ success: true, data: notifications });
    } catch (error) {
      logger.error("Error fetching system notifications: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch system notifications",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
