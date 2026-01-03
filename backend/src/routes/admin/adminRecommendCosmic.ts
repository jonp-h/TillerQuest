import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAuth, requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import { validateParams } from "middleware/validationMiddleware.js";
import { cosmicNameSchema } from "utils/validators/validationUtils.js";

export const adminRecommendCosmic = [
  requireAuth,
  requireAdmin,
  validateParams(cosmicNameSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const cosmicName = req.params.cosmicName;
      const username = req.session!.user.username || "Admin";

      await db.$transaction(async (db) => {
        await db.cosmicEvent.updateMany({
          where: {
            recommended: true,
          },
          data: {
            recommended: false,
          },
        });

        await db.cosmicEvent.update({
          where: {
            name: cosmicName,
          },
          data: {
            recommended: true,
          },
        });

        await db.log.create({
          data: {
            userId: req.session!.user.id || "",
            message: `GM ${username} has recommended the cosmic event "${cosmicName.replace(/-/g, " ")}"`,
          },
        });
      });

      res.json({
        success: true,
        data: {
          message: `Successfully changed the recommended cosmic to ${cosmicName.replace(/-/g, " ")}`,
        },
      });
    } catch (error) {
      logger.error("Error recommending cosmic: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to recommend cosmic",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
