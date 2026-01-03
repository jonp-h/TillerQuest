import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAuth, requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import { validateParams } from "middleware/validationMiddleware.js";
import { guildNameParamSchema } from "utils/validators/validationUtils.js";

export const adminDeleteGuildEnemies = [
  requireAuth,
  requireAdmin,
  validateParams(guildNameParamSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const guildName = req.params.guildName;

      await db.guildEnemy.deleteMany({
        where: {
          guild: {
            name: guildName,
          },
        },
      });

      res.json({
        success: true,
        data: {
          message: `Successfully deleted all enemies from guild: ${guildName}`,
        },
      });
    } catch (error) {
      logger.error("Error deleting guild enemies: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to delete guild enemies",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
