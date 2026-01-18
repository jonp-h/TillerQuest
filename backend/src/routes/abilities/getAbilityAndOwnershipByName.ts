import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireActiveUser } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import { validateParams } from "middleware/validationMiddleware.js";
import { abilityNameSchema } from "utils/validators/validationUtils.js";

interface GetAbilityByNameRequest extends AuthenticatedRequest {
  params: {
    abilityName: string;
  };
}

export const getAbilityAndOwnershipByName = [
  requireActiveUser,
  validateParams(abilityNameSchema),
  async (req: GetAbilityByNameRequest, res: Response) => {
    try {
      const { abilityName } = req.params;
      const userId = req.session!.user.id;

      const ability = await db.ability.findFirst({
        where: {
          name: abilityName,
        },
      });

      if (!ability) {
        res.status(404).json({
          success: false,
          error: "Ability not found",
        });
        return;
      }

      // check if user owns the ability and the root ability if applicable
      const userAbility = await db.userAbility.findFirst({
        where: {
          userId,
          abilityName,
        },
      });

      let parentAbility = null;
      if (ability.parentAbility) {
        parentAbility = await db.userAbility.findFirst({
          where: {
            userId,
            abilityName: ability.parentAbility,
          },
        });
      } else {
        // if no parent ability, consider it owned
        parentAbility = true;
      }
      res.json({
        success: true,
        data: {
          ability,
          ownAbility: !!userAbility,
          ownParentAbility: !!parentAbility,
        },
      });
    } catch (error) {
      logger.error("Failed to get ability by name: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to retrieve ability",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
