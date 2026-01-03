import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireUserIdAndActive } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";
import { validateParams } from "middleware/validationMiddleware.js";
import { userIdParamSchema } from "utils/validators/validationUtils.js";

export const getGuildByUserId = [
  requireUserIdAndActive(),
  validateParams(userIdParamSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.params.userId;

      const guild = await db.guild.findFirst({
        where: {
          members: {
            some: {
              id: userId,
            },
          },
        },
        select: {
          name: true,
          schoolClass: true,
          guildLeader: true,
          nextGuildLeader: true,
          level: true,
          icon: true,
          nextBattleVotes: true,
          enemies: {
            select: {
              name: true,
              health: true,
            },
          },
          members: {
            select: {
              id: true,
              image: true,
              title: true,
              titleRarity: true,
              username: true,
              hp: true,
              hpMax: true,
              mana: true,
              manaMax: true,
            },
          },
          imageUploads: {
            where: {
              status: "PENDING",
            },
            select: {
              id: true,
            },
          },
        },
      });

      res.json({ success: true, data: guild });
    } catch (error) {
      logger.error("Error fetching guild by user ID: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch guild by user ID",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
