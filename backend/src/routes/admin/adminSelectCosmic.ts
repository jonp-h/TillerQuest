import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAuth, requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import {
  validateBody,
  validateParams,
} from "../../middleware/validationMiddleware.js";
import { handleSetCosmic } from "../../utils/cosmics/handleSetCosmic.js";
import { ErrorMessage } from "lib/error.js";
import {
  cosmicNameSchema,
  selectCosmicSchema,
} from "utils/validators/validationUtils.js";

export const adminSelectCosmic = [
  requireAuth,
  requireAdmin,
  validateParams(cosmicNameSchema),
  validateBody(selectCosmicSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const cosmicName = req.params.cosmicName;
      const { grade, notify } = req.body;
      const username = req.session!.user.username || "Admin";

      await db.$transaction(async (tx) => {
        await handleSetCosmic(cosmicName, grade, username, notify, tx);

        await tx.log.create({
          data: {
            userId: req.session!.user.id || "",
            message: `GM ${username} has selected the cosmic event "${cosmicName.replace(/-/g, " ")}"`,
          },
        });
      });

      res.json({
        success: true,
        data: {
          message: `Successfully set ${cosmicName.replace(/-/g, " ")} as daily cosmic for ${grade}!`,
        },
      });
    } catch (error) {
      if (error instanceof ErrorMessage) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
        return;
      }

      logger.error("Error selecting cosmic: " + error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to select cosmic";
      res.status(400).json({
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      });
    }
  },
];
