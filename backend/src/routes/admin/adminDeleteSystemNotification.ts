import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAuth, requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import { ErrorMessage } from "lib/error.js";
import { validateParams } from "middleware/validationMiddleware.js";
import { idParamSchema } from "utils/validators/validationUtils.js";

export const adminDeleteSystemNotification = [
  requireAuth,
  requireAdmin,
  validateParams(idParamSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);

      await db.systemMessage.delete({
        where: { id },
      });

      res.json({
        success: true,
        data: { message: "System notification deleted successfully" },
      });
    } catch (error) {
      logger.error("Error deleting system notification: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to delete system notification",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
