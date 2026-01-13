import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAuth, requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import z from "zod";
import { validateBody } from "../../middleware/validationMiddleware.js";

const createSystemNotificationSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1).max(1000),
});

export const adminCreateSystemNotification = [
  requireAuth,
  requireAdmin,
  validateBody(createSystemNotificationSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { title, content } = req.body;

      await db.notification.create({
        data: {
          title,
          content,
        },
      });

      res.json({
        success: true,
        data: { message: "System notification created successfully" },
      });
    } catch (error) {
      logger.error("Error creating system notification: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to create system notification",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
