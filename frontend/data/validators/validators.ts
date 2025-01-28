"use server";

import { logger } from "@/lib/logger";
import { PrismaTransaction } from "@/types/prismaTransaction";
import { getUserPassiveEffect } from "../passives/getPassive";
import { User } from "@prisma/client";
import { gemstonesOnLevelUp } from "@/lib/gameSetting";
import { auth } from "@/auth";

export const healingValidator = async (
  db: PrismaTransaction,
  targetUserId: string,
  hpValue: number,
) => {
  const session = await auth();
  if (
    !session ||
    (session?.user.role !== "USER" && session?.user.role !== "ADMIN")
  ) {
    return "Not authorized";
  }

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

export const manaValidator = async (
  db: PrismaTransaction,
  targetUserId: string,
  manaValue: number,
) => {
  const session = await auth();
  if (
    !session ||
    (session?.user.role !== "USER" && session?.user.role !== "ADMIN")
  ) {
    return "Not authorized";
  }

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
  const session = await auth();
  if (
    !session ||
    (session?.user.role !== "USER" && session?.user.role !== "ADMIN")
  ) {
    return 0;
  }

  // reduce the damage by the passive effects
  const reducedDamage = await getUserPassiveEffect(
    db,
    targetUserId,
    "Protection",
  );
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

export const experienceAndLevelValidator = async (
  db: PrismaTransaction,
  user: User,
  xp: number,
) => {
  const session = await auth();
  if (
    !session ||
    (session?.user.role !== "USER" && session?.user.role !== "ADMIN")
  ) {
    throw new Error("Not authorized");
  }

  try {
    const xpMultipler = await getUserPassiveEffect(db, user.id, "Experience");
    const xpToGive = Math.round(xp * (xpMultipler + 1));
    const levelDifference = Math.floor(
      (user.xp + xpToGive) / 1000 - user.level,
    );

    let levelUpData = {};
    if (levelDifference > 0) {
      levelUpData = {
        level: { increment: levelDifference },
        gemstones: {
          increment: gemstonesOnLevelUp * levelDifference,
        },
      };
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        xp: { increment: xpToGive },
        ...levelUpData,
      },
    });
    if (levelDifference > 0) {
      logger.info(
        `LEVEL UP: User ${user.username} leveled up to level ${user.level + levelDifference}. User recieved ${xpToGive} XP. Granting a level difference of ${levelDifference} and ${gemstonesOnLevelUp * levelDifference} gemstones.`,
      );
    }
    return "Successfully gave XP to user";
  } catch (error) {
    logger.error("Validating experience and leveling up failed: " + error);
    return "Something went wrong at " + Date.now() + " with error: " + error;
  }
};
