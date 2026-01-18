import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireActiveUser } from "../../middleware/authMiddleware.js";
import { validateBody } from "middleware/validationMiddleware.js";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";
import { userIdListSchema } from "utils/validators/validationUtils.js";

export const checkIfTargetsHavePassive = [
  requireActiveUser,
  validateBody(userIdListSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const abilityName = req.params.abilityName;
      const { userIds } = req.body;

      let allUsersHavePassive = true;

      for (const targetUserId of userIds) {
        const userPassive = await db.userPassive.findFirst({
          where: {
            userId: targetUserId,
            abilityName: abilityName,
            effectType: {
              not: "Cosmic",
            },
          },
        });

        // if one user does not have the passive, set to false and break
        if (!userPassive) {
          allUsersHavePassive = false;
          break; // Exit early once we find a user without the passive
        }
      }

      res.json({
        success: true,
        data: allUsersHavePassive,
      });
    } catch (error) {
      logger.error("Unexpected error when checking passives:", {
        error: error instanceof Error ? error.message : String(error),
        userId: req.params.userId,
        stack: error instanceof Error ? error.stack : undefined,
      });

      res.status(500).json({
        success: false,
        error: "Failed to check passives. Please contact a game master.",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
