import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import {
  requireAuth,
  requireActiveUser,
} from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import { ErrorMessage } from "../../lib/error.js";
import { validateParams } from "middleware/validationMiddleware.js";
import { abilityNameSchema } from "utils/validators/validationUtils.js";

interface GetAbilityByNameRequest extends AuthenticatedRequest {
  params: {
    abilityName: string;
  };
}

export const getAbilityByName = [
  requireAuth,
  requireActiveUser,
  validateParams(abilityNameSchema),
  async (req: GetAbilityByNameRequest, res: Response) => {
    try {
      const { abilityName } = req.params;

      const ability = await db.ability.findFirst({
        where: {
          name: abilityName,
        },
      });

      if (!ability) {
        throw new ErrorMessage("Ability not found");
      }

      res.json({
        success: true,
        data: ability,
      });
    } catch (error) {
      if (error instanceof ErrorMessage) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
        return;
      }

      logger.error("Failed to get ability by name: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to retrieve ability",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
