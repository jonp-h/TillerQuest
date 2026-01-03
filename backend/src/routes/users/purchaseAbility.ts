import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { ErrorMessage } from "../../lib/error.js";
import { requireUserIdAndActive } from "../../middleware/authMiddleware.js";
import {
  validateBody,
  validateParams,
} from "../../middleware/validationMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import { selectAbility } from "utils/abilities/abilityUsage/selectAbility.js";
import {
  purchaseAbilitySchema,
  userIdParamSchema,
} from "utils/validators/validationUtils.js";

interface PurchaseAbilityProps extends AuthenticatedRequest {
  params: {
    userId: string;
  };
  body: {
    abilityName: string;
  };
}

export const purchaseAbility = [
  requireUserIdAndActive(),
  validateParams(userIdParamSchema),
  validateBody(purchaseAbilitySchema),
  async (req: PurchaseAbilityProps, res: Response) => {
    try {
      const { userId } = req.params;
      const { abilityName } = req.body;

      const user = await db.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const ability = await db.ability.findFirst({
        where: { name: abilityName },
      });

      if (!ability) {
        logger.error(
          `User ${user.username} tried to buy non-existent ability ${abilityName}`,
        );
        throw new Error("Ability not found");
      }

      // Check if user has enough gemstones
      if (user.gemstones < ability.gemstoneCost) {
        throw new ErrorMessage("Insufficient gemstones");
      }

      // Check if user already owns the ability
      const existingAbility = await db.userAbility.findFirst({
        where: {
          userId: user.id,
          abilityName: ability.name,
        },
      });

      if (existingAbility) {
        throw new ErrorMessage("You already own this ability");
      }

      const shouldActivateImmediately =
        ability.target === "Self" &&
        ability.duration === null &&
        ability.manaCost === null &&
        ability.healthCost === null;

      await db.$transaction([
        db.user.update({
          where: { id: user.id },
          data: { gemstones: { decrement: ability.gemstoneCost } },
        }),
        db.userAbility.create({
          data: { userId: user.id, abilityName: ability.name },
        }),
      ]);

      // After purchase completes, activate ability if passive ability
      if (shouldActivateImmediately) {
        await selectAbility(user.id, [user.id], ability.name);
      }

      logger.info(`User ${user.username} bought ability ${ability.name}`);

      res.json({
        success: true,
        data: {
          message: `Bought ${ability.name} successfully!${shouldActivateImmediately ? " Passive activated." : ""}`,
          ability: {
            name: ability.name,
            gemstoneCost: ability.gemstoneCost,
            activated: shouldActivateImmediately,
          },
        },
      });
    } catch (error) {
      if (error instanceof ErrorMessage) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
        return;
      }

      logger.error("Unexpected error when purchasing item:", {
        error: error instanceof Error ? error.message : String(error),
        userId: req.params.userId,
        stack: error instanceof Error ? error.stack : undefined,
      });

      res.status(500).json({
        success: false,
        error: "Failed to purchase item. Please contact a game master.",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
