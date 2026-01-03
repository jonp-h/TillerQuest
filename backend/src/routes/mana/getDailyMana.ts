import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireUserIdAndActive } from "../../middleware/authMiddleware.js";
import { ErrorMessage } from "lib/error.js";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";
import { addLog } from "data/log/addLog.js";
import { dailyArenaTokenBase, dailyManaBase } from "gameSettings.js";
import { manaValidator } from "utils/abilities/abilityValidators.js";

export const getDailyMana = [
  requireUserIdAndActive(),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id: userId, role } = req.session?.user!;

      // Archived users are not allowed to get daily mana
      if (role === "ARCHIVED") {
        throw new ErrorMessage(
          "You are not allowed to get daily mana anymore. Nice try! ;)",
        );
      }

      const targetUser = await db.user.findFirst({
        where: {
          id: userId,
        },
        select: {
          username: true,
          lastMana: true,
          role: true,
        },
      });

      if (!targetUser) {
        throw new Error(
          `User ${userId} tried to get daily mana, but the user was not found`,
        );
      }

      if (targetUser.lastMana >= new Date(new Date().setHours(0, 0, 0, 0))) {
        throw new ErrorMessage("You have already received daily mana");
      }

      const passiveMana = await db.userPassive.aggregate({
        where: {
          userId,
          effectType: "DailyMana",
        },
        _sum: {
          value: true,
        },
      });

      // get passiveValue from mana passive and add it to the daily mana, based on the user's max mana
      const passiveValue = passiveMana._sum?.value ?? 0;
      const manaValue = await manaValidator(
        db,
        userId,
        passiveValue + dailyManaBase,
      );

      const arenaTokens = await db.userPassive.aggregate({
        where: {
          userId,
          effectType: "ArenaToken",
        },
        _sum: {
          value: true,
        },
      });

      const arenaTokenValue = arenaTokens._sum?.value ?? 0;
      const totalArenaTokensToGive = arenaTokenValue + dailyArenaTokenBase;

      await db.user.update({
        where: {
          id: userId,
        },
        data: {
          mana: { increment: manaValue },
          arenaTokens: { increment: totalArenaTokensToGive },
          lastMana: new Date(),
        },
      });

      await addLog(
        db,
        userId,
        `${targetUser.username} received ${manaValue} dailyMana`,
      );

      res.json({
        success: true,
        data:
          "And as you focus, you feel your mana restoring with " +
          manaValue +
          ". You also find " +
          totalArenaTokensToGive +
          " arena tokens in your pocket.",
      });
    } catch (error) {
      if (error instanceof ErrorMessage) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
        return;
      }

      logger.error("Error claiming daily mana: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to claim daily mana",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
