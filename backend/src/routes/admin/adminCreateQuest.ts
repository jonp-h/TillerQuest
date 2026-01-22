import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import { validateBody } from "../../middleware/validationMiddleware.js";
import { ErrorMessage } from "lib/error.js";
import { questSchema } from "utils/validators/validationUtils.js";

interface CreateQuestRequest extends AuthenticatedRequest {
  body: {
    name: string;
    description?: string;
    rewardXp?: number;
    rewardItemId?: number;
    rewardGold?: number;
    questGiver: string;
  };
}

export const adminCreateQuest = [
  requireAdmin,
  validateBody(questSchema),
  async (req: CreateQuestRequest, res: Response) => {
    try {
      const {
        name,
        description,
        rewardXp,
        rewardItemId,
        rewardGold,
        questGiver,
      } = req.body;

      await db.quest.create({
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
        data: { message: "Successfully created quest" },
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

      logger.error("Error creating quest: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to create quest",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
