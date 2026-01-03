import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAuth, requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import {
  validateBody,
  validateParams,
} from "../../middleware/validationMiddleware.js";
import { ErrorMessage } from "lib/error.js";
import {
  idParamSchema,
  scheduleWishSchema,
} from "utils/validators/validationUtils.js";

export const adminScheduleWish = [
  requireAuth,
  requireAdmin,
  validateParams(idParamSchema),
  validateBody(scheduleWishSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const wishId = parseInt(req.params.wishId);
      const { scheduleDate } = req.body;

      if (isNaN(wishId)) {
        throw new ErrorMessage("Invalid wish ID");
      }

      await db.wish.update({
        where: {
          id: wishId,
        },
        data: {
          scheduled: new Date(scheduleDate),
        },
      });

      res.json({
        success: true,
        data: { message: "Successfully scheduled wish" },
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

      logger.error("Error scheduling wish: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to schedule wish",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
