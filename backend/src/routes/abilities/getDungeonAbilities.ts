import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import {
  requireAuth,
  requireActiveUser,
} from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";

export const getDungeonAbilities = [
  requireAuth,
  requireActiveUser,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const abilities = await db.ability.findMany({
        where: {
          isDungeon: true, // Filter abilities where isDungeon is true
        },
        select: {
          name: true,
          description: true,
          category: true,
          type: true,
        },
      });

      res.json({
        success: true,
        data: abilities,
      });
    } catch (error) {
      logger.error("Failed to get dungeon abilities: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to retrieve dungeon abilities",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
