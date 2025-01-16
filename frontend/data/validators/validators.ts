"use server";

import { logger } from "@/lib/logger";
import { PrismaTransaction } from "@/types/prismaTransaction";
import { getUserPassiveEffect } from "../passives/getPassive";

export const healingValidator = async (
  db: PrismaTransaction,
  targetUserId: string,
  hpValue: number,
) => {
  // check if user has any health passives to add to the healing value
  const healthBonus = await getUserPassiveEffect(db, targetUserId, "Health");
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
    } else if (targetHP && targetHP.hp + hpValue >= targetHP.hpMax) {
      return targetHP?.hpMax - targetHP?.hp;
    } else {
      return hpValue;
    }
  } catch (error) {
    logger.error("Error validating HP for user " + targetUserId + ": " + error);
    return (
      "Something went wrong. Please notify a game master of this timestamp: " +
      Date.now()
    );
  }
};

// old healing validator

// export const healingValidator = async (
//     usersCurrentHealth: number,
//     healingValue: number,
//     usersMaxHealth: number,
//   ) => {
//     // if the healing puts the user above the health treshhold, return the healing to get to the health treshold instead, else return healing
//     if (usersCurrentHealth + healingValue >= usersMaxHealth) {
//       return usersMaxHealth - usersCurrentHealth;
//     } else {
//       return healingValue;
//     }
//   };

export const manaValidator = async (
  db: PrismaTransaction,
  targetUserId: string,
  manaValue: number,
) => {
  // check if user has any mana passives to add to the mana value
  const manaBonus = await getUserPassiveEffect(db, targetUserId, "Mana");
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
    logger.error(
      "Error validating mana for user " + targetUserId + ": " + error,
    );
    return (
      "Something went wrong. Please notify a game master of this timestamp: " +
      Date.now()
    );
  }
};

//TODO: confirm it has necessary changes
/**
 * Validates and calculates the damage to be applied to a user, considering passive effects and health thresholds.
 *
 * @param db - The Prisma transaction object for database operations.
 * @param targetUserId - The ID of the user who is the target of the damage.
 * @param targetUserHp - The current health points of the target user.
 * @param damage - The initial amount of damage to be applied.
 * @param healthTreshold - The minimum health threshold that the target user should not go below. Defaults to 0.
 * @returns The final amount of damage to be applied, adjusted for passive effects and health thresholds.
 */
export const damageValidator = async (
  db: PrismaTransaction,
  targetUserId: string,
  targetUserHp: number,
  damage: number,
  healthTreshold: number = 0,
) => {
  // reduce the damage by the passive effects
  const reducedDamage = await getUserPassiveEffect(db, targetUserId, "Damage");
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
