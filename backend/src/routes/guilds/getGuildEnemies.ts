import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import {
  requireAuth,
  requireActiveUser,
} from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import { validateParams } from "middleware/validationMiddleware.js";
import { guildNameParamSchema } from "utils/validators/validationUtils.js";

export const getGuildEnemies = [
  requireAuth,
  requireActiveUser,
  validateParams(guildNameParamSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const guildName = req.params.guildName;

      const enemies = await db.guildEnemy.findMany({
        where: {
          guildName,
        },
        select: {
          id: true,
          icon: true,
          maxHealth: true,
          enemyId: true,
          attack: true,
          guildName: true,
          health: true,
          name: true,
        },
        orderBy: {
          id: "asc",
        },
      });

      res.json({ success: true, data: enemies });
    } catch (error) {
      logger.error("Error fetching guild enemies: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch enemies",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
