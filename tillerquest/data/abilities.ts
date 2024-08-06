"use server";

import { db } from "@/lib/db";
import { gemstonesOnLevelUp, xpMultiplier } from "@/lib/gameSetting";
import { $Enums, Ability, User } from "@prisma/client";

// due to the limitations of Prisma, we can't add do recursive queries.
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
        type: true,
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

// decrement the cost from the user's gemstones
const startTransaction = async (buyingUserId: string, abilityCost: number) => {
  try {
    await db.user.update({
      where: {
        id: buyingUserId,
      },
      data: {
        gemstones: {
          decrement: abilityCost,
        },
      },
    });
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const buyAbility = async (userId: string, ability: Ability) => {
  if (await startTransaction(userId, ability.cost)) {
    try {
      await db.userAbility.create({
        data: {
          userId,
          abilityName: ability.name,
        },
      });

      if (ability.isPassive) {
        await db.effectsOnUser.create({
          data: {
            userId,
            abilityName: ability.name,
            value: ability.value ?? 0,
            endTime: undefined,
          },
        });
      }
      return "Success";
    } catch {
      return "Something went wrong";
    }
  } else {
    return "Insufficient funds";
  }
};

export const checkIfUserOwnsAbility = async (
  userId: string,
  abilityName: string
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

// Ability usage

export const selectAbility = async (
  user: User,
  targetUserId: string,
  ability: Ability
) => {
  switch (ability.type) {
    // case "":
    //   var endTime = new Date();
    //   endTime.setMinutes(endTime.getMinutes() + (abilityDuration || 0));
    //   var endTimeISOString = endTime.toISOString();
    //   return useDebuffAbility(
    //     userId,
    //     userId,
    //     userMana || 0,
    //     abilityCost,
    //     abilityValue || 0,
    //     endTimeISOString,
    //     abilityXpGiven
    //   );
    case "Heal":
      return await useHealAbility(user, targetUserId, ability);
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
          decrement: ability.cost,
        },
        xp: {
          increment: ability.xpGiven,
        },
      },
    });
  } catch (error) {
    console.error(error);
  }
};

// Helper functions for specific ability types

const checkHP = async (targetUserId: string, hpValue: number) => {
  try {
    const targetHP = await db.user.findFirst({
      where: {
        id: targetUserId,
      },
      select: { hp: true, hpMax: true },
    });

    if (targetHP?.hp === 0) {
      return 0;
    } else if (targetHP && targetHP?.hp + hpValue >= targetHP?.hpMax) {
      return targetHP?.hpMax - targetHP?.hp;
    } else {
      return hpValue;
    }
  } catch {
    return 0;
  }
};

// export const useDebuffAbility = async (
//   castingUserId: string,
//   targetUserId: string,
//   userMana: number,
//   abilityManaCost: number,
//   value: number,
//   endTime: string,
//   xpGiven: number
// ) => {
//   if (userMana < abilityManaCost) {
//     return false;
//   }

//   try {
//     await db.effectsOnUser.create({
//       data: {
//         userId: targetUserId,
//         value,
//         endTime,
//       },
//     });

//     await finalizeAbilityUsage(castingUserId, abilityManaCost, xpGiven);

//     return true;
//   } catch {
//     return false;
//   }
// };

export const useHealAbility = async (
  castingUser: User,
  targetUserId: string,
  ability: Ability
) => {
  if (castingUser.mana < ability.cost) {
    return "Insufficient mana";
  }

  const valueToHeal = await checkHP(targetUserId, ability.value ?? 0);
  if (valueToHeal === 0) {
    return "Target is already at full health";
  }

  try {
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
  } catch {
    return "Something went wrong";
  }
};
