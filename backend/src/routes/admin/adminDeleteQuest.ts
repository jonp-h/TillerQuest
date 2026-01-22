import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import { validateParams } from "../../middleware/validationMiddleware.js";
import { ErrorMessage } from "lib/error.js";
import { idParamSchema } from "utils/validators/validationUtils.js";

interface UpdateQuestRequest extends AuthenticatedRequest {
  params: {
    questId: string;
  };
}

export const adminDeleteQuest = [
  requireAdmin,
  validateParams(idParamSchema("questId")),
  async (req: UpdateQuestRequest, res: Response) => {
    try {
      await db.quest.delete({
        where: {
          id: parseInt(req.params.questId, 10),
        },
      });

      res.json({
        success: true,
        data: { message: "Successfully deleted quest" },
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

      logger.error("Error deleting quest: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to delete quest",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
