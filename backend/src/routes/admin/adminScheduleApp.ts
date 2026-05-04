import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import {
  validateBody,
  validateParams,
} from "../../middleware/validationMiddleware.js";
import { ErrorMessage } from "lib/error.js";
import {
  appNameSchema,
  scheduleSchema,
} from "utils/validators/validationUtils.js";

export const adminScheduleApp = [
  requireAdmin,
  validateParams(appNameSchema),
  validateBody(scheduleSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const appName = req.params.appName;
      const { scheduledDate } = req.body;

      await db.app.update({
        where: {
          name: appName,
        },
        data: {
          scheduled: new Date(scheduledDate),
        },
      });

      res.json({
        success: true,
        data: "Successfully scheduled app",
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

      logger.error("Error scheduling app: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to schedule app",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
