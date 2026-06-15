import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import { ErrorMessage } from "../../lib/error.js";
import { validateParams } from "../../middleware/validationMiddleware.js";
import { appNameSchema } from "../../utils/validators/validationUtils.js";

export const adminRemoveSchedule = [
  requireAdmin,
  validateParams(appNameSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const appName = req.params.appName;

      await db.app.update({
        where: {
          name: appName,
        },
        data: {
          scheduled: null,
        },
      });

      res.json({
        success: true,
        data: "Successfully removed app schedule",
      });
    } catch (error) {
      if (error instanceof ErrorMessage) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
        return;
      }

      logger.error("Error removing app schedule: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to remove app schedule",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
