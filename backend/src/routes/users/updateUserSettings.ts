import { Response } from "express";
import { $Enums, db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import {
  requireAuth,
  requireUserIdAndNew,
} from "../../middleware/authMiddleware.js";
import { ErrorMessage } from "lib/error.js";
import { checkNewUserSecret } from "utils/validators/secretValidation.js";
import {
  validateBody,
  validateParams,
} from "middleware/validationMiddleware.js";
import { validateUserCreation } from "utils/validators/userUpdateValidation.js";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";
import {
  escapeHtml,
  updateUserSettingsSchema,
  userIdParamSchema,
} from "utils/validators/validationUtils.js";

interface UserUpdateSettingsRequest extends AuthenticatedRequest {
  body: {
    username: string;
    publicHighscore: boolean;
    archiveConsent: boolean;
  };
}

export const updateUserSettings = [
  requireAuth,
  requireUserIdAndNew(),
  validateParams(userIdParamSchema),
  validateBody(updateUserSettingsSchema),
  async (req: UserUpdateSettingsRequest, res: Response) => {
    try {
      const userId = req.params.userId;

      const { username, publicHighscore, archiveConsent } = req.body;

      const userNameTaken = await db.user.findFirst({
        where: {
          username: {
            equals: username,
            mode: "insensitive",
          },
          NOT: {
            id: userId,
          },
        },
      });

      if (userNameTaken) {
        throw new ErrorMessage("Try a different username");
      }

      await db.user.update({
        where: { id: userId },
        data: {
          username: escapeHtml(username),
          publicHighscore: publicHighscore,
          archiveConsent: archiveConsent,
        },
      });

      res.json({ success: true, data: "Profile updated successfully." });
    } catch (error) {
      if (error instanceof ErrorMessage) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
        return;
      }

      logger.error("Error updating user: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to update user",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
