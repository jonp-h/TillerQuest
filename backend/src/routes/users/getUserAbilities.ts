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

interface GetUserAbilitiesRequest extends AuthenticatedRequest {
  params: {
    userId: string;
  };
}

export const getUserAbilities = [
  requireAuth,
  requireActiveUser,
  validateParams(userIdParamSchema),
  async (req: GetUserAbilitiesRequest, res: Response) => {
    try {
      const { userId } = req.params;

      const abilities = await db.userAbility.findMany({
        where: {
          userId,
        },
        select: {
          ability: {
            select: {
              name: true,
              icon: true,
            },
          },
        },
      });

      res.json({
        success: true,
        data: abilities,
      });
    } catch (error) {
      logger.error("Failed to get user abilities: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to retrieve user abilities",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
