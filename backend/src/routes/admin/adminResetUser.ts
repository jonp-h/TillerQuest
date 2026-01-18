import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import { ErrorMessage } from "lib/error.js";
import { validateParams } from "middleware/validationMiddleware.js";
import { userIdParamSchema } from "utils/validators/validationUtils.js";

export const adminResetUser = [
  requireAdmin,
  validateParams(userIdParamSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.params.userId;

      const user = await db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          mana: true,
          abilities: {
            select: {
              id: true,
              ability: {
                select: {
                  gemstoneCost: true,
                },
              },
            },
          },
        },
      });

      if (!user) {
        throw new ErrorMessage("User not found");
      }

      // ------- The following can be made into a function ------

      let totalGemstoneCost = 0;
      for (const ability of user.abilities) {
        totalGemstoneCost += ability.ability.gemstoneCost;
      }

      await db.user.update({
        where: { id: user.id },
        data: {
          role: "INACTIVE",
          hp: 40,
          hpMax: 40,
          mana: Math.min(user.mana, 40),
          manaMax: 40,
          gemstones: {
            increment: totalGemstoneCost,
          },
          class: null,
          guildName: null,
          games: {
            deleteMany: {
              userId: user.id,
            },
          },
          logs: {
            create: {
              global: false,
              message: `RESET: Your account has been reset. You have been refunded ${totalGemstoneCost} gemstones.`,
            },
          },
          title: "Newborn",
          titleRarity: "Common",
          sessions: {
            deleteMany: {
              userId: user.id,
            },
          },
          passives: {
            deleteMany: {
              userId: user.id,
            },
          },
          access: {
            set: [],
          },
          abilities: {
            deleteMany: {
              userId: user.id,
            },
          },
        },
      });

      res.json({
        success: true,
        data: "User successfully reset",
      });
    } catch (error) {
      if (error instanceof ErrorMessage) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
        return;
      }

      logger.error("Error resetting user: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to reset user",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
