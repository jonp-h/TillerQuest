import { Response } from "express";
import { logger } from "../../lib/logger.js";
import {
  requireAuth,
  requireActiveUser,
} from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import z from "zod";
import {
  validateBody,
  validateParams,
} from "../../middleware/validationMiddleware.js";
import { ErrorMessage } from "../../lib/error.js";
import { selectAbility } from "utils/abilities/abilityUsage/selectAbility.js";
import {
  abilityNameSchema,
  userIdListSchema,
} from "utils/validators/validationUtils.js";

interface UseAbilityRequest extends AuthenticatedRequest {
  params: {
    abilityName: string;
  };
  body: {
    userIds: string[];
  };
}
/**
 * Selects and uses an ability for a user on a target user.
 *
 * @param user - The user who is using the ability.
 * @param targetIds - The ID of the targets on whom the ability is being used.
 * @param abilityName - The name of the ability being used.
 * @returns A promise that resolves to a string message indicating the result of the ability usage.
 *
 * @remarks
 * - If the user's HP is 0, they cannot use abilities and a message is returned.
 * - If the user does not have enough mana to use the ability, a message is returned.
 * - Depending on the type of ability, the appropriate function is called to handle the ability usage.
 */
export const useAbility = [
  requireAuth,
  requireActiveUser,
  validateParams(abilityNameSchema),
  validateBody(userIdListSchema),
  async (req: UseAbilityRequest, res: Response) => {
    try {
      const { abilityName } = req.params;
      const { userIds } = req.body;
      const userId = req.session!.user.id;

      const result = await selectAbility(userId, userIds, abilityName);

      res.json(result);
    } catch (error) {
      if (error instanceof ErrorMessage) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
        return;
      }

      logger.error("Ability usage failed: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to use ability",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
