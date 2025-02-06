"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { PrismaTransaction } from "@/types/prismaTransaction";
import { $Enums, Ability, User } from "@prisma/client";

export const getUserPassives = async (userId: string) => {
  const session = await auth();
  if (
    !session ||
    (session?.user.role !== "USER" && session?.user.role !== "ADMIN")
  ) {
    throw new Error("Not authorized");
  }

  try {
    const passives = await db.userPassive.findMany({
      where: {
        userId,
      },
      select: {
        endTime: true,
        ability: {
          select: {
            name: true,
            description: true,
            icon: true,
          },
        },
      },
    });
    return passives;
  } catch {
    return null;
  }
};

/**
 * Retrieves the passive value for a specific user, based on passive type. Returns all the values added together.
 *
 * @param userId - The ID of the user.
 * @param type - The type of the passive.
 * @returns The value of the passive of a given type, or 0 if no passive is found.
 */
export const getUserPassiveEffect = async (
  db: PrismaTransaction,
  userId: string,
  type: $Enums.AbilityType,
) => {
  const session = await auth();
  if (
    !session ||
    (session?.user.role !== "USER" && session?.user.role !== "ADMIN")
  ) {
    throw new Error("Not authorized");
  }

  try {
    const userPassives = await db.userPassive.findMany({
      where: {
        userId,
        effectType: type as $Enums.AbilityType,
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
    logger.error("Error getting user passive by type " + type + ": " + error);
    return 0;
  }
};

/**
 * Checks if a passive ability is active for a given user. Does not return cosmic passives.
 *
 * @param user - The user whose passive abilities are being checked.
 * @param ability - The ability to check for active status.
 * @returns A promise that resolves to a boolean indicating whether the passive ability is active. Does not return cosmic passives.
 * @throws Will throw an error if the user is not authorized.
 */
export const checkIfPassiveIsActive = async (user: User, ability: Ability) => {
  const session = await auth();
  if (session?.user?.id !== user.id) {
    throw new Error("Not authorized");
  }

  try {
    const activePassive = await db.userPassive.findFirst({
      where: {
        userId: user.id,
        abilityName: ability.name,
        effectType: {
          not: "Cosmic",
        },
      },
    });

    return !!activePassive;
  } catch (error) {
    logger.error("Error checking if active passive: " + error);
    return false;
  }
};

//FIXME: unused?
// export const getUserPassivesByType = async (userId: string, type: string) => {
//   try {
//     const passives = await db.userPassive.findMany({
//       where: {
//         userId,
//         effectType: type as $Enums.AbilityType,
//       },
//     });
//     return passives;
//   } catch (error) {
//     console.error("Error getting user passives by type " + error);
//     return null;
//   }
// };
