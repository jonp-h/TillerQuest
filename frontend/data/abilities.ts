"use server";

import { db } from "@/lib/db";
import { Ability, User } from "@prisma/client";
import {
  checkHP,
  checkLevelUp,
  checkMana,
  getUserPassiveEffect,
} from "./helpers";

// due to the limitations of Prisma, we can't do recursive queries.
// This manual approach goes 4 levels deep
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
    return null;
  }
};

export const getUserAbilities = async (userId: string) => {
  try {
    const abilities = await db.userAbility.findMany({
      where: {
        userId,
      },
    });
    return abilities;
  } catch {
    return null;
  }
};

export const getOwnedAbilities = async (userId: string) => {
  try {
    const abilities = await db.userAbility.findMany({
      where: {
        userId,
      },
      select: {
        abilityName: true,
      },
    });
    return abilities;
  } catch {
    return null;
  }
};

export const getAbility = async (abilityName: string) => {
  try {
    const ability = await db.ability.findFirst({
      where: {
        name: abilityName,
      },
    });
    return ability;
  } catch {
    return null;
  }
};

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

// ------------------- Ability transactions -------------------

/**
 * Buys an ability for a user.
 *
 * @param userId - The ID of the user.
 * @param ability - The ability to be bought.
 * @returns A promise that resolves to "Success" if the ability is successfully bought, or a string indicating an error if something goes wrong.
 */
export const buyAbility = async (user: User, ability: Ability) => {
  try {
    return db.$transaction(async (db) => {
      // check if user has enough gemstones
      if (user.gemstones < 0) {
        throw new Error("Insufficient gemstones");
      }

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

      if (ability.isPassive) {
        // user can only have one passive of each type (mana, health, xp)
        // delete the old one, before adding the upgraded version
        const parentPassive = await db.userPassive.findFirst({
          where: {
            userId: user.id,
            abilityName: ability.parentAbility ?? "",
          },
          select: {
            id: true,
          },
        });

        if (parentPassive) {
          await db.userPassive.delete({
            where: {
              id: parentPassive?.id,
            },
          });
        }

        // if the ability duration is undefined, create a counter from the current time for 600000ms (10 minutes)
        await db.userPassive.create({
          data: {
            userId: user.id,
            effectType: ability.type,
            abilityName: ability.name,
            value: ability.value ?? 0,
            endTime: ability.duration
              ? new Date(Date.now() + ability.duration * 60000).toISOString()
              : undefined, //TODO: datetime?
          },
        });
      }
      return "Success";
    });
  } catch (error) {
    return "Something went wrong with " + error;
  }
};

// ------------------- Ability usage -------------------

export const selectAbility = async (
  user: User,
  targetUserId: string,
  ability: Ability,
) => {
  if (user.hp === 0) {
    return "You can't use abilities while dead";
  }

  if (user.mana < (ability.manaCost || 0)) {
    return "Insufficient mana";
  }

  // check ability type and call the appropriate function
  switch (ability.type) {
    // heal the target
    case "Heal":
      return await useHealAbility(user, targetUserId, ability);
    // give mana to the target
    case "Mana":
      return await useManaAbility(user, targetUserId, ability);
    case "Transfer":
      return await useTransferAbility(user, targetUserId, ability);
  }
};

// finally decrement the cost from the user's mana
// and increment the user's xp by the xpGiven
const finalizeAbilityUsage = async (castingUser: User, ability: Ability) => {
  try {
    await db.user.update({
      where: {
        id: castingUser.id,
      },
      data: {
        mana: {
          decrement: ability.manaCost || 0,
        },
        xp: {
          increment: ability.xpGiven || 0,
        },
      },
    });
  } catch (error) {
    console.error(error);
  }

  // after reciving XP, the casting user should be checked for level up
  checkLevelUp(castingUser);
};

// ---------------------------- Helper functions for specific ability types ----------------------------

export const useHealAbility = async (
  castingUser: User,
  targetUserId: string,
  ability: Ability,
) => {
  try {
    await db.$transaction(async (db) => {
      // validate health to heal and passives
      let valueToHeal = await checkHP(targetUserId, ability.value ?? 0);

      if (valueToHeal === 0) {
        return "Target is already at full health";
      } else if (valueToHeal === "dead") {
        return "You can't heal a dead target. The dead require a different kind of magic.";
      } else if (typeof valueToHeal === "string") {
        return valueToHeal;
      }

      await db.user.update({
        where: {
          id: targetUserId,
        },
        data: {
          hp: {
            increment: valueToHeal,
          },
        },
      });

      await finalizeAbilityUsage(castingUser, ability);

      return "Target healed for " + valueToHeal;
    });
  } catch {
    console.log("Error using heal ability");
    return "Something went wrong";
  }
};

export const useManaAbility = async (
  castingUser: User,
  targetUserId: string,
  ability: Ability,
) => {
  // validate mana value and passives
  try {
    db.$transaction(async (db) => {
      let value = await checkMana(targetUserId, ability.value ?? 0);

      await db.user.update({
        where: {
          id: targetUserId,
        },
        data: {
          mana: {
            increment: value,
          },
        },
      });

      await finalizeAbilityUsage(castingUser, ability);

      return "Target given " + value + " mana";
    });
  } catch {
    console.log("Error using mana ability");
    return "Something went wrong";
  }
};

export const useTransferAbility = async (
  castingUser: User,
  targetUserId: string,
  ability: Ability,
) => {
  try {
    return await db.$transaction(async (db) => {
      // validate mana value and passives
      let value = await checkMana(targetUserId, ability.value ?? 0);
      await db.user.update({
        where: {
          id: targetUserId,
        },
        data: {
          mana: {
            increment: value,
          },
        },
      });

      await db.user.update({
        where: {
          id: castingUser.id,
        },
        data: {
          mana: {
            decrement: value,
          },
        },
      });

      await db.user.update({
        where: {
          id: castingUser.id,
        },
        data: {
          xp: {
            increment: ability.xpGiven || 0,
          },
        },
      });
      return "Target given " + value + " of your mana.";
    });
  } catch (error) {
    console.error("Error using transfer ability " + error);
    return "Something went wrong";
  }
};
