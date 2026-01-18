import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireActiveUser } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";

export const getTypeQuestText = [
  requireActiveUser,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const typeQuestText = await db.typeQuestText.findFirst({
        select: {
          text: true,
        },
        orderBy: {
          id: "asc",
        },
        skip: Math.floor(Math.random() * (await db.typeQuestText.count())),
      });

      if (!typeQuestText) {
        res.status(404).json({
          success: false,
          error: "No TypeQuest texts available",
        });
        return;
      }

      res.json({ success: true, data: typeQuestText });
    } catch (error) {
      logger.error("Error fetching random TypeQuest text: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch TypeQuest text",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
