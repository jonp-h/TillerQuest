"use server";

import { auth } from "@/auth";
import { getMembersByCurrentUserGuild } from "@/data/user/getGuildmembers";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { Ability, User } from "@prisma/client";
import { selectAbility } from "../abilityUsage/useAbility";

/**
 * Buys an ability for a user.
 *
 * @param userId - The ID of the user.
 * @param ability - The ability to be bought.
 * @returns A promise that resolves to "Success" if the ability is successfully bought, or a string indicating an error if something goes wrong.
 */
export const buyAbility = async (userId: string, ability: Ability) => {
  const session = await auth();
  if (session?.user?.id !== userId) {
    throw new Error("Not authorized");
  }

  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("Something went wrong. Please notify a game master.");
  }

  // check if user has enough gemstones
  if (user.gemstones < 0) {
    throw new Error("Insufficient gemstones");
  }

  try {
    return db.$transaction(async (db) => {
      // decrement the cost from the user's gemstones
      await db.user.update({
        where: {
          id: user.id,
        },
        data: {
          gemstones: {
            decrement: ability.gemstoneCost,
          },
        },
      });

      await db.userAbility.create({
        data: {
          userId: user.id,
          abilityName: ability.name,
        },
      });

      // ease of use for passive abilities with unlimited duration
      const useAbilityImmediately =
        ability.target === -1 && ability.duration === null;

      if (useAbilityImmediately) {
        selectAbility(user.id, [user.id], ability);
      }

      logger.info(`User ${user.id} bought ability ${ability.name}`);
      return "Bought " + ability.name + " successfully!" + useAbilityImmediately
        ? " Ability activated."
        : "";
    });
  } catch (error) {
    logger.error(
      `Error buying ability ${ability.name} by user ${user.username}: ${error}`,
    );
    return (
      "Something went wrong. Please notify a game master of this timestamp: " +
      Date.now()
    );
  }
};
