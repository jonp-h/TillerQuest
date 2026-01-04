import { Response } from "express";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireUserIdAndActive } from "../../middleware/authMiddleware.js";
import { validateParams } from "../../middleware/validationMiddleware.js";
import { userIdParamSchema } from "utils/validators/validationUtils.js";

export const getNotifications = [
  requireUserIdAndActive(),
  validateParams(userIdParamSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.params.userId;

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
