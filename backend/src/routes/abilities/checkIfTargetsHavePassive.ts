import { Request, Response } from "express";
import { z } from "zod";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import {
  requireActiveUser,
  requireAuth,
} from "../../middleware/authMiddleware.js";
import { validateBody } from "middleware/validationMiddleware.js";

const passiveCheckSchema = z.object({
  userIds: z.array(z.cuid()),
  abilityName: z.string().min(1),
});

export const checkIfTargetsHavePassive = [
  requireAuth,
  requireActiveUser,
  validateBody(passiveCheckSchema),
  async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;

      const { userIds, abilityName } = req.body;

      let allUsersHavePassive = true;
      await Promise.all(
        userIds.map(async (targetUserId: string) => {
          const userPassive = await db.userPassive.findFirst({
            where: {
              userId: targetUserId,
              abilityName: abilityName,
              effectType: {
                not: "Cosmic",
              },
            },
          });

          // if one user does not have the passive, return false
          if (!userPassive) {
            allUsersHavePassive = false;
            res.json({
              success: true,
              data: allUsersHavePassive,
            });
            return;
          }
        }),
      );

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
