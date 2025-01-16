"use server";

import { db } from "@/lib/db";
import { manaValidator } from "../validators/validators";
import { dailyMana } from "@/lib/gameSetting";
import { logger } from "@/lib/logger";
import { User } from "@prisma/client";

export const getDailyMana = async (user: User) => {
  // get passiveValue from mana passive and add it to the daily mana, based on the user's max mana
  let manaValue = await manaValidator(db, user.id, dailyMana);

  if (typeof manaValue === "number") {
    // use get mana
    return db.user.update({
      where: { id: user.id },
      data: { mana: { increment: manaValue }, lastMana: new Date() },
    });
  } else {
    logger.error("Error getting daily " + manaValue + " mana: " + user.id);
    return "Error getting daily mana";
  }
};
