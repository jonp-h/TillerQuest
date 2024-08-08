"use server";
import { db } from "@/lib/db";
import { getUserAbilities } from "./abilities";
import { gemstonesOnLevelUp, xpMultiplier } from "@/lib/gameSetting";
import { User } from "@prisma/client";

// ---------------- Health Helpers ----------------

export const checkHP = async (targetUserId: string, hpValue: number) => {
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
  manaValue = ((await checkManaPassives(targetUserId)) ?? 0) + manaValue;

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

// local helper function to check mana passives
const checkManaPassives = async (userId: string) => {
  const userAbilities = await getUserAbilities(userId);

  if (userAbilities === null) {
    return 0;
  }
  try {
    const abilities = await db.ability.findMany({
      where: {
        name: {
          in: userAbilities.map((userAbility) => userAbility.abilityName),
        },
        isPassive: true,
        type: "Mana",
      },
    });

    if (abilities.length === 0) {
      return 0;
    }
    abilities.sort((a, b) => (a.value ?? 0) - (b.value ?? 0));

    return abilities[0].value;
  } catch (error) {
    console.error(error);
    return 0;
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
