import { Response } from "express";
import { logger } from "../../lib/logger.js";
import {
  requireActiveUser,
  requireAuth,
} from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";
import { db } from "lib/db.js";
import { validateParams } from "middleware/validationMiddleware.js";
import { userIdParamSchema } from "utils/validators/validationUtils.js";

export const getUserLog = [
  requireAuth,
  requireActiveUser,
  validateParams(userIdParamSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.params.userId;
      const logs = await db.log.findMany({
        where: {
          userId,
          debug: false, // Exclude debug logs
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      res.json({
        success: true,
        data: logs,
      });
    } catch (error) {
      logger.error("Failed to get user logs: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to get user logs.",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
