import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireActiveUser } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import { validateParams } from "../../middleware/validationMiddleware.js";
import { userIdParamSchema } from "utils/validators/validationUtils.js";

interface GetUserProfileAbilitiesRequest extends AuthenticatedRequest {
  params: {
    userId: string;
  };
}

export const getUserProfileAbilities = [
  requireActiveUser,
  validateParams(userIdParamSchema),
  async (req: GetUserProfileAbilitiesRequest, res: Response) => {
    try {
      const { userId } = req.params;

      const abilities = await db.userAbility.findMany({
        where: {
          userId,
          ability: {
            userPassives: {
              none: {
                userId: userId,
              },
            },
          },
        },
        select: {
          ability: {
            select: {
              name: true,
              icon: true,
            },
          },
        },
        orderBy: {
          ability: {
            name: "asc",
          },
        },
      });

      res.json({
        success: true,
        data: abilities,
      });
    } catch (error) {
      logger.error("Failed to get user profile abilities: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to retrieve user profile abilities",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
