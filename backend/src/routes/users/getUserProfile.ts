import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import {
  requireAuth,
  requireActiveUser,
} from "../../middleware/authMiddleware.js";
import { validateParams } from "middleware/validationMiddleware.js";
import { usernameParamSchema } from "utils/validators/validationUtils.js";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";

export const getUserProfile = [
  requireAuth,
  requireActiveUser,
  validateParams(usernameParamSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const username = req.params.username;
      const user = await db.user.findUnique({
        where: { username },
        select: {
          id: true,
          title: true,
          titleRarity: true,
          name: true,
          username: true,
          lastname: true,
          class: true,
          gold: true,
          hp: true,
          hpMax: true,
          mana: true,
          manaMax: true,
          xp: true,
          gemstones: true,
          arenaTokens: true,
          turns: true,
          level: true,
          image: true,
          guildName: true,
          schoolClass: true,
          lastMana: true,
          publicHighscore: true,
          archiveConsent: true,
          guild: {
            select: {
              guildLeader: true,
              icon: true,
            },
          },
          inventory: {
            where: {
              type: "Badge",
            },
            select: {
              name: true,
              icon: true,
              description: true,
              rarity: true,
            },
          },
          passives: {
            select: {
              endTime: true,
              passiveName: true,
              icon: true,
              value: true,
              ability: {
                select: {
                  name: true,
                  description: true,
                },
              },
            },
          },

          abilities: {
            where: {
              ability: {
                userPassives: {
                  none: {
                    userId: username,
                  },
                },
              },
            },
            select: {
              ability: {
                select: {
                  name: true,
                  icon: true,
                },
              },
            },
            orderBy: {
              ability: {
                name: "asc",
              },
            },
          },
        },
      });

      res.json({ success: true, data: user });
    } catch (error) {
      logger.error("Error fetching user profile by username: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch user profile",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
