"use server";

import { db } from "@/lib/db";
import { manaValidator } from "../validators/validators";
import { dailyMana } from "@/lib/gameSetting";
import { logger } from "@/lib/logger";
import { auth } from "@/auth";
import { addLog } from "../log/addLog";

export const getDailyMana = async (userId: string) => {
  const session = await auth();
  if (session?.user?.id !== userId) {
    throw new Error("Not authorized");
  }

  const targetUser = await db.user.findFirst({
    where: {
      id: userId,
    },
    select: {
      username: true,
      lastMana: true,
    },
  });

  if (!targetUser) {
    logger.error(
      `User ${userId} tried to get daily mana, but the user was not found`,
    );
    return "User not found";
  }

  if (
    targetUser?.lastMana &&
    targetUser.lastMana >= new Date(new Date().setHours(0, 0, 0, 0))
  ) {
    return "Already received daily mana";
  }

  // get passiveValue from mana passive and add it to the daily mana, based on the user's max mana
  const manaValue = await manaValidator(db, userId, dailyMana);

  if (typeof manaValue === "number") {
    // use get mana
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

    addLog(
      db,
      userId,
      `${targetUser.username} recieved ${manaValue} dailyMana`,
    );
    return "And as you focus, you feel your mana restoring. You also find a token in your pocket.";
  } else {
    logger.error(
      "Error getting daily " + manaValue + " mana: " + targetUser.username,
    );
    return "Error getting daily mana";
  }
};
