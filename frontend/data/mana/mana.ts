"use server";

import { db } from "@/lib/db";
import { manaValidator } from "../validators/validators";
import { dailyArenaTokenBase, dailyManaBase } from "@/lib/gameSetting";
import { logger } from "@/lib/logger";
import { addLog } from "../log/addLog";
import {
  AuthorizationError,
  validateUserIdAndActiveUserAuth,
} from "@/lib/authUtils";
import { ErrorMessage } from "@/lib/error";
import { ServerActionResult } from "@/types/serverActionResult";

export const getDailyMana = async (
  userId: string,
): Promise<ServerActionResult> => {
  try {
    const session = await validateUserIdAndActiveUserAuth(userId);

    // Archived users are not allowed to get daily mana
    if (session.user.role === "ARCHIVED") {
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
      `${targetUser.username} recieved ${manaValue} dailyMana`,
    );
    return {
      success: true,
      data:
        "And as you focus, you feel your mana restoring with " +
        manaValue +
        ". You also find " +
        totalArenaTokensToGive +
        " arena tokens in your pocket.",
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access attempt to get daily mana");
      return {
        success: false,
        error: error.message,
      };
    }

    if (error instanceof ErrorMessage) {
      return {
        success: false,
        error: error.message,
      };
    }

    logger.error("Error getting daily mana: ", error);
    throw new Error("Error getting daily mana");
  }
};
