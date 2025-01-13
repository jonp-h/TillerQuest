"use server";
import { db } from "@/lib/db";
import {
  gemstonesOnLevelUp,
  guildmemberResurrectionDamage,
  minResurrectionHP,
} from "@/lib/gameSetting";
import { $Enums, AbilityType, User } from "@prisma/client";
import { getUserPassivesByType } from "./passives";
import { getMembersByCurrentUserGuild } from "./user";

// ---------------- Passive Helpers ----------------

/**
 * Retrieves the passive value for a specific user, based on passive type. Returns all the values added together.
 *
 * @param userId - The ID of the user.
 * @param type - The type of the passive.
 * @returns The value of the passive of a given type, or 0 if no passive is found.
 */
export const getUserPassiveEffect = async (userId: string, type: string) => {
  const userPassives = await getUserPassivesByType(userId, type);

  if (!userPassives) {
    return 0;
  }

  var value = 0;
  userPassives.forEach((effect) => {
    value += effect.value ?? 0;
  });

  return value;
};

// ---------------- Health Helpers ----------------

export const checkHP = async (targetUserId: string, hpValue: number) => {
  // check if user has any health passives to add to the healing value
  const healthBonus = await getUserPassiveEffect(targetUserId, "Health");
  hpValue += healthBonus;

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
  targetUserId: string,
  targetUserHp: number,
  damage: number,
  healthTreshold: number = 0,
) => {
  // reduce the damage by the passive effects
  const reducedDamage = await getUserPassiveEffect(targetUserId, "Damage");
  const newDamage = damage - reducedDamage;

  // ensure the damage does not become negative
  const finalDamage = newDamage < 0 ? 0 : newDamage;

  // return the damage to take, unless it brings the user below the health treshhold, then return the damage to bring the user to the health treshold
  if (targetUserHp - finalDamage <= healthTreshold) {
    return targetUserHp - healthTreshold;
  } else {
    return finalDamage;
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
            member.id,
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
          await db.userPassive.create({
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
  const manaBonus = await getUserPassiveEffect(targetUserId, "Mana");
  manaValue += manaBonus;

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
    console.error("Error checking Mana " + error);
  }
};

// ---------------- XP Helpers ----------------

export const checkLevelUp = async (user: User) => {
  try {
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
  } catch (error) {
    console.error("Error checking level up " + error);
    return "Something went wrong with " + error;
  }
};
