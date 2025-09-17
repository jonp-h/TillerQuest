"use server";

import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { selectAbility } from "../abilityUsage/useAbility";
import {
  AuthorizationError,
  validateUserIdAndActiveUserAuth,
} from "@/lib/authUtils";
import { ErrorMessage } from "@/lib/error";
import { ServerActionResult } from "@/types/serverActionResult";

/**
 * Buys an ability for a user.
 *
 * @param userId - The ID of the user.
 * @param ability - The ability to be bought.
 * @returns A promise that resolves to "Success" if the ability is successfully bought, or a string indicating an error if something goes wrong.
 */
export const buyAbility = async (
  userId: string,
  abilityName: string,
): Promise<ServerActionResult> => {
  try {
    await validateUserIdAndActiveUserAuth(userId);

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
      throw new ErrorMessage("Insufficient gemstones");
    }

    const ability = await db.ability.findFirst({
      where: {
        name: abilityName,
      },
    });

    if (!ability) {
      logger.error(
        `User ${user.username} tried to buy non-existent ability ${abilityName}`,
      );
      throw new Error("Something went wrong. Please notify a game master.");
    }

    return await db.$transaction(
      async (db) => {
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
          ability.target === "Self" && ability.duration === null;

        if (useAbilityImmediately) {
          // FIXME: Not awaited because of timeout errors
          selectAbility(user.id, [user.id], ability.name);
        }

        logger.info(`User ${user.username} bought ability ${ability.name}`);
        return {
          success: true,
          data:
            "Bought " +
            ability.name +
            " successfully!" +
            (useAbilityImmediately ? " Ability activated." : ""),
        };
      },
      {
        // Increased timeout because of long and unoptimized query in selectAbility
        timeout: 10000,
      },
    );
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn(
        `Unauthorized attempt to buy ability ${abilityName} by user ${userId}: ${error.message}`,
      );
      return { success: false, error: error.message };
    }

    if (error instanceof ErrorMessage) {
      return { success: false, error: error.message };
    }

    logger.error(
      `Error buying ability ${abilityName} by user ${userId}: ${error}`,
    );
    return {
      success: false,
      error:
        "Something went wrong. Please notify a game master of this timestamp: " +
        Date.now().toLocaleString("no-NO"),
    };
  }
};
