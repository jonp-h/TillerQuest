import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAuth, requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import z from "zod";
import { validateBody } from "../../middleware/validationMiddleware.js";
import { ErrorMessage } from "lib/error.js";

const updateSystemNotificationSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1).max(1000),
});

export const adminUpdateSystemNotification = [
  requireAuth,
  requireAdmin,
  validateBody(updateSystemNotificationSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { title, content } = req.body;

      if (isNaN(id)) {
        throw new ErrorMessage("Invalid notification ID");
      }

      const message = await db.notification.findFirst({
        where: { id },
      });

      if (!message) {
        throw new ErrorMessage(`System notification with ID ${id} not found`);
      }

      await db.notification.update({
        where: { id },
        data: {
          title,
          content,
        },
      });

      res.json({
        success: true,
        data: { message: "System notification updated successfully" },
      });
    } catch (error) {
      if (error instanceof ErrorMessage) {
        res.status(400).json({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      logger.error("Error updating system notification: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to update system notification",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
