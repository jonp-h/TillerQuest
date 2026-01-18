import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import { validateBody } from "../../middleware/validationMiddleware.js";
import { updateApplicationSettingSchema } from "utils/validators/validationUtils.js";

interface UpdateApplicationSettingsRequest extends AuthenticatedRequest {
  body: {
    key: string;
    value: string;
  };
}

export const adminUpdateApplicationSettings = [
  requireAdmin,
  validateBody(updateApplicationSettingSchema),
  async (req: UpdateApplicationSettingsRequest, res: Response) => {
    try {
      const sessionUserId = req.session!.user.id;
      const { key, value } = req.body;

      if (!sessionUserId) {
        res.status(401).json({
          success: false,
          error: "User not authenticated",
        });
        return;
      }

      await db.applicationSettings.update({
        where: {
          key: key,
        },
        data: {
          value: value,
        },
      });

      res.json({
        success: true,
        data: `Successfully updated application setting: ${key}`,
      });
    } catch (error) {
      logger.error("Error updating application settings: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to update application settings",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
