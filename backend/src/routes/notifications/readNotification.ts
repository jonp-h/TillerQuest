import { Response } from "express";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireUserIdAndActive } from "../../middleware/authMiddleware.js";
import { validateParams } from "middleware/validationMiddleware.js";
import { idParamSchema } from "utils/validators/validationUtils.js";
import { validateBody } from "../../middleware/validationMiddleware.js";
import { userIdParamSchema } from "../../utils/validators/validationUtils.js";

interface ReadNotificationRequest extends AuthenticatedRequest {
  params: {
    userId: string;
  };
  body: {
    messageId: number;
  };
}

export const readNotification = [
  requireUserIdAndActive(),
  validateParams(userIdParamSchema),
  validateBody(idParamSchema("messageId")),
  async (req: ReadNotificationRequest, res: Response) => {
    try {
      const userId = req.params.userId;
      const messageId = req.body.messageId;

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
