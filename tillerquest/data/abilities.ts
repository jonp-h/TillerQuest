"use server";

import { db } from "@/lib/db";

// due to the limitations of Prisma, we can't add do recursive queries. This manual approach goes 4 levels deep
export const getAbilityHierarchy = async () => {
  try {
    // gets all abilities that have no parents, and their children
    const roots = await db.ability.findMany({
      where: {
        parents: {
          none: {},
        },
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

// TODO: redundant?
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
  userId: string,
  userMana: number,
  abilityType: string,
  abilityCost: number,
  abilityValue: number | null,
  abilityXpGiven: number,
  abilityDuration: number | null
) => {
  switch (abilityType) {
    case "Debuff":
      var endTime = new Date();
      endTime.setMinutes(endTime.getMinutes() + (abilityDuration || 0));
      var endTimeISOString = endTime.toISOString();
      useDebuffAbility(
        userId,
        userId,
        userMana || 0,
        abilityCost,
        abilityValue || 0,
        endTimeISOString,
        abilityXpGiven
      );
    case "Heal":
      useHealAbility(
        userId,
        userId,
        userMana || 0,
        abilityCost,
        abilityValue || 0,
        abilityXpGiven
      );
  }
};

// finally decrement the cost from the user's mana
// and increment the user's xp by the xpGiven
const finalizeAbilityUsage = async (
  castingUserId: string,
  abilityManaCost: number,
  xpGiven: number
) => {
  await db.user.update({
    where: {
      id: castingUserId,
    },
    data: {
      mana: {
        decrement: abilityManaCost,
      },
      xp: {
        increment: xpGiven,
      },
    },
  });
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

export const useDebuffAbility = async (
  castingUserId: string,
  targetUserId: string,
  userMana: number,
  abilityManaCost: number,
  value: number,
  endTime: string,
  xpGiven: number
) => {
  if (userMana < abilityManaCost) {
    return false;
  }

  try {
    await db.effectsOnUser.create({
      data: {
        userId: targetUserId,
        value,
        endTime,
      },
    });

    await finalizeAbilityUsage(castingUserId, abilityManaCost, xpGiven);

    return true;
  } catch {
    return false;
  }
};

export const useHealAbility = async (
  castingUserId: string,
  targetUserId: string,
  userMana: number,
  abilityManaCost: number,
  value: number,
  xpGiven: number
) => {
  if (userMana < abilityManaCost) {
    return false;
  }

  value = await checkHP(targetUserId, value);
  if (value === 0) {
    return false;
  }

  try {
    await db.user.update({
      where: {
        id: targetUserId,
      },
      data: {
        hp: {
          increment: value,
        },
      },
    });

    await finalizeAbilityUsage(castingUserId, abilityManaCost, xpGiven);

    return true;
  } catch {
    return false;
  }
};
