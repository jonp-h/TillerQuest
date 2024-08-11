"use server";
import { db } from "@/lib/db";
import { gemstonesOnLevelUp, xpMultiplier } from "@/lib/gameSetting";
import { User } from "@prisma/client";
import { getUserEffectsByType } from "./effects";

// ---------------- Effect Helpers ----------------

export const checkEffects = async (userId: string, type: string) => {
  removeAllOldEffects();

  return getUserPassiveEffect(userId, type);
};

/**
 * Retrieves the passive value for a specific user, based on effect type. Returns all the values added together.
 *
 * @param userId - The ID of the user.
 * @param type - The type of the effect.
 * @returns The value of the passive effects of a given type, or 0 if no effect is found.
 */
export const getUserPassiveEffect = async (userId: string, type: string) => {
  const userEffects = await getUserEffectsByType(userId, type);

  if (!userEffects) {
    return 0;
  }

  var value = 0;
  userEffects.forEach((effect) => {
    value += effect.value ?? 0;
  });

  return value;
};

// removes every user's old effects
export const removeAllOldEffects = async () => {
  // if the effect is expired, remove it
  const effects = await db.effectsOnUser.findMany({
    where: {
      endTime: {
        lte: new Date(),
      },
    },
  });
  // if the effect is expired, remove it (but not passives without an endTime)
  if (effects) {
    effects.forEach(async (effect) => {
      await db.effectsOnUser.delete({
        where: {
          id: effect.id,
          endTime: {
            not: undefined,
          },
        },
      });
    });
  }
};

// ---------------- Health Helpers ----------------

export const checkHP = async (targetUserId: string, hpValue: number) => {
  // check if user has any health passives to add to the healing value
  hpValue = ((await checkEffects(targetUserId, "Health")) ?? 0) + hpValue;

  try {
    const targetHP = await db.user.findFirst({
      where: {
        id: targetUserId,
      },
      select: { hp: true, hpMax: true },
    });

    if (targetHP?.hp === 0) {
      return "dead";
    } else if (targetHP && targetHP?.hp + hpValue >= targetHP?.hpMax) {
      return targetHP?.hpMax - targetHP?.hp;
    } else {
      return hpValue;
    }
  } catch (error) {
    console.error("Error checking HP");
    return "Something went wrong with" + error;
  }
};

// ---------------- Mana Helpers ----------------

export const checkMana = async (targetUserId: string, manaValue: number) => {
  // check if user has any mana passives to add to the mana value
  manaValue = ((await checkEffects(targetUserId, "Mana")) ?? 0) + manaValue;

  try {
    const targetMana = await db.user.findFirst({
      where: {
        id: targetUserId,
      },
      select: { mana: true, manaMax: true },
    });

    if (targetMana && targetMana?.mana + manaValue >= targetMana?.manaMax) {
      return targetMana?.manaMax - targetMana?.mana;
    } else {
      return manaValue;
    }
  } catch (error) {
    console.error("Error checking Mana");
  }
};

// ---------------- XP Helpers ----------------

export const checkLevelUp = async (user: User) => {
  try {
    if (user.xp >= user.xpToLevel) {
      const excessXp = user.xp - user.xpToLevel;
      const newXpToLevel = user.xpToLevel * xpMultiplier;
      const newLevel = user.level + 1;

      await db.user.update({
        where: { id: user.id },
        data: {
          level: newLevel,
          xp: excessXp,
          xpToLevel: newXpToLevel,
          gemstones: { increment: gemstonesOnLevelUp },
        },
      });
      checkLevelUp({
        ...user,
        xp: excessXp,
        xpToLevel: newXpToLevel,
        level: newLevel,
      });
    }
  } catch (error) {
    console.error("Error checking level up");
    return "Something went wrong with" + error;
  }
};
