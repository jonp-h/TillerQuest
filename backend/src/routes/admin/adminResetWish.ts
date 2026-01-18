import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import { ErrorMessage } from "lib/error.js";
import { validateParams } from "middleware/validationMiddleware.js";
import { idParamSchema } from "utils/validators/validationUtils.js";

export const adminResetWish = [
  requireAdmin,
  validateParams(idParamSchema("wishId")),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const wishId = parseInt(req.params.wishId);

      await db.wish.update({
        where: {
          id: wishId,
        },
        data: {
          value: 0,
          wishVotes: {
            deleteMany: {},
          },
          scheduled: null,
        },
      });

      res.json({
        success: true,
        data: { message: "Successfully reset wish" },
      });
    } catch (error) {
      if (error instanceof ErrorMessage) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
        return;
      }

      logger.error("Error resetting wish: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to reset wish",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
