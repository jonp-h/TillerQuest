import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireUserIdAndActive } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";

interface GetUserAbilitiesRequest extends AuthenticatedRequest {
  params: {
    userId: string;
  };
}

export const getUserAbilities = [
  requireUserIdAndActive(),
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
