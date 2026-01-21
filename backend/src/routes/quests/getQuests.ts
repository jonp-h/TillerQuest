import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireActiveUser } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";

export const getQuests = [
  requireActiveUser,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const quests = await db.quest.findMany({
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      });

      res.json({ success: true, data: quests });
    } catch (error) {
      logger.error("Error fetching wishes:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch wishes",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
