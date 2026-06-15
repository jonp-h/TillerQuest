import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import {
  validateBody,
  validateParams,
} from "../../middleware/validationMiddleware.js";
import { ErrorMessage } from "../../lib/error.js";
import { appNameSchema } from "../../utils/validators/validationUtils.js";
import z from "zod";

const appUpdateSchema = z.object({
  downloadUrl: z.url().nullable(),
});

interface AppUpdateRequest extends AuthenticatedRequest {
  params: {
    appName: string;
  };
  body: {
    downloadUrl: string | null;
  };
}

export const adminUpdateApp = [
  requireAdmin,
  validateParams(appNameSchema),
  validateBody(appUpdateSchema),
  async (req: AppUpdateRequest, res: Response) => {
    try {
      const appName = req.params.appName;
      const { downloadUrl } = req.body;

      await db.app.update({
        where: {
          name: appName,
        },
        data: {
          downloadUrl: downloadUrl,
        },
      });

      res.json({
        success: true,
        data: "Successfully updated app",
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

      logger.error("Error updating app: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to update app",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
