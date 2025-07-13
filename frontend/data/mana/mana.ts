"use server";

import { db } from "@/lib/db";
import { manaValidator } from "../validators/validators";
import { dailyMana } from "@/lib/gameSetting";
import { logger } from "@/lib/logger";
import { addLog } from "../log/addLog";
import { AuthorizationError, checkUserIdAndActiveAuth } from "@/lib/authUtils";
import { ErrorMessage } from "@/lib/error";

export const getDailyMana = async (userId: string) => {
  try {
    const session = await checkUserIdAndActiveAuth(userId);

    // Archived users are not allowed to get daily mana
    if (session.user.role === "ARCHIVED") {
      throw new ErrorMessage("You are not allowed to get daily mana.");
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

    // get passiveValue from mana passive and add it to the daily mana, based on the user's max mana
    const manaValue = await manaValidator(db, userId, dailyMana);

    await db.user.update({
      where: {
        id: userId,
      },
      data: {
        mana: { increment: manaValue },
        arenaTokens: { increment: 1 },
        lastMana: new Date(),
      },
    });

    await addLog(
      db,
      userId,
      `${targetUser.username} recieved ${manaValue} dailyMana`,
    );
    return (
      "And as you focus, you feel your mana restoring with " +
      manaValue +
      ". You also find a token in your pocket."
    );
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access attempt to get daily mana");
      throw error;
    }

    if (error instanceof ErrorMessage) {
      throw error;
    }

    logger.error("Error getting daily mana: ", error);
    throw new Error("Error getting daily mana");
  }
};
