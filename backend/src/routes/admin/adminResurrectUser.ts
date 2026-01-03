import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAuth, requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import {
  validateBody,
  validateParams,
} from "../../middleware/validationMiddleware.js";
import { minResurrectionHP } from "../../gameSettings.js";
import { resurrectUser } from "../../utils/users/resurrectUser.js";
import {
  resurrectUserSchema,
  userIdParamSchema,
} from "utils/validators/validationUtils.js";

interface ResurrectUserRequest extends AuthenticatedRequest {
  body: {
    effect:
      | "free"
      | "criticalMiss"
      | "phone"
      | "xp"
      | "hat"
      | "quiz"
      | "criticalHit";
  };
  params: {
    userId: string;
  };
}

export const adminResurrectUser = [
  requireAuth,
  requireAdmin,
  validateParams(userIdParamSchema),
  validateBody(resurrectUserSchema),
  async (req: ResurrectUserRequest, res: Response) => {
    try {
      const userId = req.params.userId;
      const { effect } = req.body;

      await db.$transaction(async (db) => {
        const user = await db.user.findFirst({
          where: {
            id: userId,
          },
          select: {
            hp: true,
            username: true,
          },
        });

        if (!user) {
          res.status(404).json({
            success: false,
            error: "User not found",
          });
          return;
        }

        if (user.hp !== 0) {
          res.status(400).json({
            success: false,
            error: "User is not dead!",
          });
          return;
        }

        // If the effect is free, the user will be resurrected without any consequences
        if (effect === "free") {
          await db.user.update({
            data: {
              hp: minResurrectionHP,
            },
            where: {
              id: userId,
            },
          });

          res.json({
            success: true,
            data: {
              message: "The resurrection was successful",
            },
          });
          return;
        }

        // Apply resurrection with effects
        switch (effect) {
          case "criticalMiss":
            await resurrectUser(db, userId, [
              "Phone-loss",
              "Reduced-xp-gain",
              "Hat-of-shame",
              "Pop-quiz",
            ]);
            break;
          case "phone":
            await resurrectUser(db, userId, ["Phone-loss"]);
            break;
          case "xp":
            await resurrectUser(db, userId, ["Reduced-xp-gain"]);
            break;
          case "hat":
            await resurrectUser(db, userId, ["Hat-of-shame"]);
            break;
          case "quiz":
            await resurrectUser(db, userId, ["Pop-quiz"]);
            break;
          case "criticalHit":
            await resurrectUser(db, userId, []);
            break;
        }

        res.json({
          success: true,
          data: {
            message:
              "The resurrection was successful, but it took its toll on the guild. All members of the guild have been damaged.",
          },
        });
      });
    } catch (error) {
      logger.error("Error resurrecting user: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to resurrect user",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
