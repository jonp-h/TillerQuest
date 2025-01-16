"use server";

import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { PrismaTransaction } from "@/types/prismaTransaction";
import { $Enums } from "@prisma/client";

export const getUserPassives = async (userId: string) => {
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
