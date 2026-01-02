import { Response } from "express";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireUserIdAndActive } from "../../middleware/authMiddleware.js";

export const readNotification = [
  requireUserIdAndActive(),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const messageId = parseInt(req.params.id, 10);
      const userId = req.session?.user.id;

      await db.systemMessage.update({
        where: {
          id: messageId,
        },
        data: {
          readers: {
            connect: {
              id: userId,
            },
          },
        },
      });

      res.json({ success: true, data: "Notification discarded!" });
    } catch (error) {
      logger.error("Error reading notification: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to read notification",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
