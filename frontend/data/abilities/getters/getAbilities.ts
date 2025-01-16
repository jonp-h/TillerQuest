"use server";

import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

/**
 * Retrieves the hierarchy of abilities from the database. Due to the limitations of Prisma, we can't do recursive queries.
 *
 * This function fetches all abilities that do not have a parent and
 * includes their children up to four levels deep.
 *
 * @returns {Promise<Array<{name: string, category: string, children: Array<{name: string, children: Array<{name: string, children: Array<{name: string, children: Array<{name: string}>}>}>}>}>> | null}
 * A promise that resolves to an array of root abilities with their hierarchical children, or null if an error occurs.
 */
export const getAbilityHierarchy = async () => {
  try {
    // gets all abilities that have no parents, and their children
    const roots = await db.ability.findMany({
      where: {
        parent: null,
      },
      select: {
        name: true,
        category: true,
        children: {
          select: {
            name: true,
            children: {
              select: {
                name: true,
                children: {
                  select: {
                    name: true,
                    children: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return roots;
  } catch {
    logger.error("Failed to get ability hierarchy");
    return null;
  }
};

/**
 * Retrieves the abilities of a user from the database.
 *
 * @param userId - The unique identifier of the user whose abilities are to be retrieved.
 * @returns A promise that resolves to an array of abilities if successful, or null if an error occurs.
 *
 * @throws Will log an error message if the retrieval fails.
 */
export const getUserAbilities = async (userId: string) => {
  try {
    const abilities = await db.userAbility.findMany({
      where: {
        userId,
      },
    });
    return abilities;
  } catch {
    logger.error("Failed to get user abilities for user: " + userId);
    return null;
  }
};

/**
 * Retrieves an ability by its name from the database.
 *
 * @param {string} abilityName - The name of the ability to retrieve.
 * @returns {Promise<object | null>} A promise that resolves to the ability object if found, or null if not found or an error occurs.
 */
export const getAbilityByName = async (abilityName: string) => {
  try {
    const ability = await db.ability.findFirst({
      where: {
        name: abilityName,
      },
    });
    return ability;
  } catch {
    logger.error("Failed to get ability by name: " + abilityName);
    return null;
  }
};

/**
 * Checks if a user owns a specific ability.
 *
 * @param userId - The ID of the user.
 * @param abilityName - The name of the ability to check.
 * @returns A promise that resolves to a boolean indicating whether the user owns the ability.
 */
export const checkIfUserOwnsAbility = async (
  userId: string,
  abilityName: string,
) => {
  try {
    const ability = await db.userAbility.findFirst({
      where: {
        userId,
        abilityName: abilityName,
      },
    });
    return !!ability;
  } catch {
    return false;
  }
};
