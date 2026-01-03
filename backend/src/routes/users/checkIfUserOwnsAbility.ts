import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import {
  requireAuth,
  requireActiveUser,
} from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import { validateParams } from "../../middleware/validationMiddleware.js";
import { checkIfUserOwnsAbilitySchema } from "utils/validators/validationUtils.js";

interface CheckIfUserOwnsAbilityRequest extends AuthenticatedRequest {
  params: {
    userId: string;
    abilityName: string;
  };
}

export const checkIfUserOwnsAbility = [
  requireAuth,
  requireActiveUser,
  validateParams(checkIfUserOwnsAbilitySchema),
  async (req: CheckIfUserOwnsAbilityRequest, res: Response) => {
    try {
      const { userId, abilityName } = req.params;

      const ability = await db.userAbility.findFirst({
        where: {
          userId,
          abilityName: abilityName,
        },
      });

      res.json({
        success: true,
        data: {
          owns: !!ability,
        },
      });
    } catch (error) {
      logger.error("Failed to check if user owns ability: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to check ability ownership",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
