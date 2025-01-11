"use server";
import { db } from "@/lib/db";
import {
  gemstonesOnLevelUp,
  guildmemberResurrectionDamage,
  minResurrectionHP,
  xpMultiplier,
} from "@/lib/gameSetting";
import { $Enums, AbilityType, User } from "@prisma/client";
import { getUserEffectsByType } from "./effects";
import { getMembersByCurrentUserGuild } from "./user";

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

// ---------------- Validators ----------------

export const damageValidator = async (
  userHealth: number,
  damageToTake: number,
  healthTreshold: number,
) => {
  // return the dametaken, unless it brings the user below the healthtreshhold, then return the damage to bring the user to the health treshold
  if (userHealth - damageToTake <= healthTreshold) {
    return userHealth - healthTreshold;
  } else {
    return damageToTake;
  }
};

export const healingValidator = async (
  usersCurrentHealth: number,
  healingValue: number,
  usersMaxHealth: number,
) => {
  // if the healing puts the user above the health treshhold, return the healing to get to the health treshold instead, else return healing
  if (usersCurrentHealth + healingValue >= usersMaxHealth) {
    return usersMaxHealth - usersCurrentHealth;
  } else {
    return healingValue;
  }
};

export const resurrectUser = async (userId: string, effects: string[]) => {
  await db.$transaction(async (db) => {
    const user = await db.user.update({
      data: {
        hp: minResurrectionHP,
      },
      where: {
        id: userId,
      },
      select: { guildName: true },
    });

    if (user.guildName) {
      // get all guildmembers and remove the resurrected user from the guildmembers array
      let guildMembers = await getMembersByCurrentUserGuild(
        user.guildName,
      ).then((member) => member!.filter((member) => member.id !== userId));

      await Promise.all(
        guildMembers?.map(async (member) => {
          const damageToTake = await damageValidator(
            member.hp,
            guildmemberResurrectionDamage,
            minResurrectionHP,
          );

          return db.user.update({
            where: {
              id: member.id,
            },
            data: {
              hp: { decrement: damageToTake },
            },
          });
        }) || [],
      );
    }
    await Promise.all(
      // if the effect array is empty, none will be added
      effects.map(async (effect) => {
        try {
          console.log(effect);
          await db.effectsOnUser.create({
            data: {
              userId: userId,
              abilityName: effect,
              endTime: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
              effectType: "Deathsave" as AbilityType,
            },
          });
        } catch (error) {
          console.error("Error resurrecting user" + error);
          return "Something went wrong with" + error;
        }
      }),
    );
  });
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
    db.$transaction(async (db) => {
      // if the user has enough xp to level up (1000xp per level)
      const levelDifference = Math.floor(user.xp / 1000) + 1 - user.level;
      if (levelDifference > 0) {
        console.log("leveldifference", levelDifference);
        await db.user.update({
          where: { id: user.id },
          data: {
            level: { increment: levelDifference },
            gemstones: { increment: gemstonesOnLevelUp },
          },
        });
      }
    });
  } catch (error) {
    console.error("Error checking level up");
    return "Something went wrong with" + error;
  }
};
