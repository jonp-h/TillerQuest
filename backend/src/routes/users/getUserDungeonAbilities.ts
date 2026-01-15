import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import {
  requireAuth,
  requireActiveUser,
} from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import { validateParams } from "../../middleware/validationMiddleware.js";
import { userIdParamSchema } from "utils/validators/validationUtils.js";

interface GetUserDungeonAbilitiesRequest extends AuthenticatedRequest {
  params: {
    userId: string;
  };
}

export const getUserDungeonAbilities = [
  requireAuth,
  requireActiveUser,
  validateParams(userIdParamSchema),
  async (req: GetUserDungeonAbilitiesRequest, res: Response) => {
    try {
      const { userId } = req.params;

      const userDungeonAbilities = await db.userAbility.findMany({
        where: {
          userId,
          ability: {
            isDungeon: true,
          },
        },
        select: {
          ability: true,
        },
      });

      res.json({
        success: true,
        data: userDungeonAbilities.map((ua) => ua.ability),
      });
    } catch (error) {
      logger.error("Failed to get user dungeon abilities: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to retrieve user dungeon abilities",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
