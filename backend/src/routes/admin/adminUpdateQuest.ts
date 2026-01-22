import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import {
  validateBody,
  validateParams,
} from "../../middleware/validationMiddleware.js";
import { ErrorMessage } from "lib/error.js";
import {
  idParamSchema,
  questSchema,
} from "utils/validators/validationUtils.js";

interface UpdateQuestRequest extends AuthenticatedRequest {
  params: {
    questId: string;
  };
  body: {
    name: string;
    description?: string;
    rewardXp?: number;
    rewardItemId?: number;
    rewardGold?: number;
    questGiver: string;
  };
}

export const adminUpdateQuest = [
  requireAdmin,
  validateParams(idParamSchema("questId")),
  validateBody(questSchema),
  async (req: UpdateQuestRequest, res: Response) => {
    try {
      const {
        name,
        description,
        rewardXp,
        rewardItemId,
        rewardGold,
        questGiver,
      } = req.body;

      await db.quest.update({
        where: {
          id: parseInt(req.params.questId, 10),
        },
        data: {
          name,
          description: description || "",
          rewardXp: rewardXp || 0,
          rewardItem: rewardItemId
            ? { connect: { id: rewardItemId } }
            : undefined,
          rewardGold: rewardGold || 0,
          questGiver,
        },
      });

      res.json({
        success: true,
        data: { message: "Successfully updated quest" },
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

      logger.error("Error updating quest: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to update quest",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
