"use server";

import { AuthorizationError, validateActiveUserAuth } from "@/lib/authUtils";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { PrismaTransaction } from "@/types/prismaTransaction";
import { $Enums } from "@prisma/client";

export const getUserPassives = async (userId: string) => {
  try {
    await validateActiveUserAuth();

    const passives = await db.userPassive.findMany({
      where: {
        userId,
      },
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
    });
    return passives;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access to user passives: " + error);
      throw error;
    }

    logger.error("Error getting user passives: " + error);
    throw new Error(
      "Something went wrong while fetching user passives. Please inform a game master of the following timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

/**
 * Retrieves the passive value for a specific user, based on passive type. Returns all the values added together.
 *
 * @param userId - The ID of the user.
 * @param type - The type of the passive.
 * @param cosmic - Whether to include cosmic passives in the search.
 * @returns The value of the passive of a given type, or 0 if no passive is found. If cosmic is true, only cosmic passives are returned.
 */
export const getUserPassiveEffect = async (
  db: PrismaTransaction,
  userId: string,
  type: $Enums.AbilityType,
  cosmic = false,
) => {
  try {
    await validateActiveUserAuth();

    const cosmicData = cosmic ? { cosmicEvent: true } : null;

    const userPassives = await db.userPassive.findMany({
      where: {
        userId,
        effectType: type as $Enums.AbilityType,
        ...cosmicData,
      },
    });

    if (!userPassives) {
      return 0;
    }

    let value = 0;
    userPassives.map((effect) => {
      value += effect.value ?? 0;
    });

    return value;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access to user passive by type: " + error);
      throw error;
    }

    logger.error("Error getting user passive by type " + type + ": " + error);
    return 0;
  }
};

/**
 * Checks if a passive ability is active for given users. Does not return cosmic passives.
 *
 * @param targetUserIds[] - The users whose passive abilities are being checked.
 * @param abilityName - The ability to check for active status.
 * @returns A promise that resolves to a boolean indicating whether the passive ability is active. Does not return cosmic passives.
 * @throws Will throw an error if the user is not authorized.
 */
export const checkIfAllTargetsHavePassive = async (
  targetUserIds: string[],
  abilityName: string,
) => {
  try {
    await validateActiveUserAuth();

    let allUsersHavePassive = true;
    await Promise.all(
      targetUserIds.map(async (targetUserId) => {
        const userPassive = await db.userPassive.findFirst({
          where: {
            userId: targetUserId,
            abilityName: abilityName,
            effectType: {
              not: "Cosmic",
            },
          },
        });

        // if one user does not have the passive, return false
        if (!userPassive) {
          allUsersHavePassive = false;
          return allUsersHavePassive;
        }
      }),
    );

    return allUsersHavePassive;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access to check user passives: " + error);
      throw error;
    }

    logger.error("Error checking if all users have passive: " + error);
    return false;
  }
};
