import { $Enums } from "lib/db.js";
import { logger } from "lib/logger.js";
import { PrismaTransaction } from "types/prismaTransaction.js";

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
    logger.error("Error getting user passive by type " + type + ": " + error);
    return 0;
  }
};
