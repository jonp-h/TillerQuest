import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireActiveUser } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import { validateParams } from "../../middleware/validationMiddleware.js";
import { userIdParamSchema } from "utils/validators/validationUtils.js";

interface GetUserPassivesRequest extends AuthenticatedRequest {
  params: {
    userId: string;
  };
}

export const getUserPassives = [
  requireActiveUser,
  validateParams(userIdParamSchema),
  async (req: GetUserPassivesRequest, res: Response) => {
    try {
      const { userId } = req.params;

      const passives = await db.userPassive.findMany({
        where: {
          userId,
        },
        select: {
          endTime: true,
          passiveName: true,
          icon: true,
          value: true,
          ability: {
            select: {
              name: true,
              description: true,
            },
          },
        },
      });

      res.json({
        success: true,
        data: passives,
      });
    } catch (error) {
      logger.error("Failed to get user passives: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to retrieve user passives",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
