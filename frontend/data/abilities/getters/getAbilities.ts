"use server";

import { auth } from "@/auth";
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
  const session = await auth();
  if (
    !session ||
    (session?.user.role !== "USER" && session?.user.role !== "ADMIN")
  ) {
    throw new Error("Not authorized");
  }

  try {
    // gets all abilities that have no parents, and their children
    const roots = await db.ability.findMany({
      where: {
        parent: null,
        category: {
          not: "Cosmic", // exclude cosmic abilities
        },
      },
      select: {
        name: true,
        icon: true,
        category: true,
        children: {
          select: {
            name: true,
            icon: true,
            children: {
              select: {
                name: true,
                icon: true,
                children: {
                  select: {
                    name: true,
                    icon: true,
                    children: {
                      select: {
                        name: true,
                        icon: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return roots;
  } catch (error) {
    logger.error("Failed to get ability hierarchy:" + error);
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
  const session = await auth();
  if (
    !session ||
    (session?.user.role !== "USER" && session?.user.role !== "ADMIN")
  ) {
    throw new Error("Not authorized");
  }

  try {
    const abilities = await db.userAbility.findMany({
      where: {
        userId,
      },
      select: {
        ability: {
          select: {
            name: true,
            icon: true,
          },
        },
      },
    });
    return abilities;
  } catch {
    logger.error("Failed to get user abilities for user: " + userId);
    return null;
  }
};

/**
 * Retrieves the abilities of a userprofile from the database.
 *
 * @param userId - The unique identifier of the user whose abilities are to be retrieved.
 * @returns A promise that resolves to an array of abilities if successful, or null if an error occurs. Filters out abilities that the target already has as a passive.
 *
 * @throws Will log an error message if the retrieval fails.
 */
export const getUserProfileAbilities = async (userId: string) => {
  const session = await auth();
  if (
    !session ||
    (session?.user.role !== "USER" && session?.user.role !== "ADMIN")
  ) {
    throw new Error("Not authorized");
  }

  try {
    const abilities = await db.userAbility.findMany({
      where: {
        userId,
        ability: {
          userPassives: {
            none: {
              userId: userId,
            },
          },
        },
      },
      select: {
        ability: {
          select: {
            name: true,
            icon: true,
          },
        },
      },
      orderBy: {
        ability: {
          name: "asc",
        },
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
  const session = await auth();
  if (
    !session ||
    (session?.user.role !== "USER" && session?.user.role !== "ADMIN")
  ) {
    throw new Error("Not authorized");
  }

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
  const session = await auth();
  if (
    !session ||
    (session?.user.role !== "USER" && session?.user.role !== "ADMIN")
  ) {
    throw new Error("Not authorized");
  }

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

export const getDungeonAbilities = async () => {
  const session = await auth();
  if (
    !session ||
    (session?.user.role !== "USER" && session?.user.role !== "ADMIN")
  ) {
    throw new Error("Not authorized");
  }

  try {
    const abilities = await db.ability.findMany({
      where: {
        isDungeon: true, // Filter abilities where isDungeon is true
      },
      select: {
        name: true, // Select specific fields (e.g., name) if needed
        description: true,
        category: true,
        type: true,
      },
    });
    return abilities;
  } catch {
    logger.error("Failed to get Dungeon Abilities");
    return null;
  }
};

export const getUserDungeonAbilities = async (userId: string) => {
  const session = await auth();
  if (
    !session ||
    (session?.user.role !== "USER" && session?.user.role !== "ADMIN")
  ) {
    throw new Error("Not authorized");
  }

  try {
    const userDungeonAbilities = await db.userAbility.findMany({
      where: {
        userId,
        ability: {
          isDungeon: true,
        },
      },
      select: {
        ability: true,
      },
    });

    return userDungeonAbilities;
  } catch (error) {
    logger.error("Failed to get Dungeon Abilities", error);
    return null;
  }
};
