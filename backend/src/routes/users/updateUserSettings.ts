import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireUsernameAndActive } from "../../middleware/authMiddleware.js";
import { ErrorMessage } from "lib/error.js";
import { validateBody } from "middleware/validationMiddleware.js";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";
import {
  escapeHtml,
  updateUserSettingsSchema,
} from "utils/validators/validationUtils.js";

interface UserUpdateSettingsRequest extends AuthenticatedRequest {
  params: {
    username: string;
  };
  body: {
    newUsername: string;
    publicHighscore: boolean;
    archiveConsent: boolean;
  };
}

export const updateUserSettings = [
  requireUsernameAndActive(),
  validateBody(updateUserSettingsSchema),
  async (req: UserUpdateSettingsRequest, res: Response) => {
    try {
      const username = req.params.username;

      const { newUsername, publicHighscore, archiveConsent } = req.body;
      const userId = req.session!.user.id;

      await db.$transaction(async (tx) => {
        const userNameTaken = await tx.user.findFirst({
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

        await tx.user.update({
          where: { username },
          data: {
            username: escapeHtml(newUsername),
            publicHighscore: publicHighscore,
            archiveConsent: archiveConsent,
          },
        });
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
