import { logger } from "@/lib/logger";
import { PrismaTransaction } from "@/types/prismaTransaction";
import { getUserPassiveEffect } from "../passives/getPassive";
import { User } from "@prisma/client";
import { gemstonesOnLevelUp } from "@/lib/gameSetting";
import { addLog } from "../log/addLog";
import { AuthorizationError, checkActiveUserAuth } from "@/lib/authUtils";

export const healingValidator = async (
  db: PrismaTransaction,
  targetUserId: string,
  hpValue: number,
) => {
  try {
    await checkActiveUserAuth();

    // check if user has any health passives to add to the healing value
    const healthBonus = await getUserPassiveEffect(db, targetUserId, "Health");
    hpValue += healthBonus;

    const targetHP = await db.user.findFirst({
      where: {
        id: targetUserId,
      },
      select: { hp: true, hpMax: true },
    });

    if (targetHP?.hp === 0) {
      return "User is dead"; // If the user is dead, no healing can be applied
    } else if (targetHP && targetHP.hp + hpValue >= targetHP.hpMax) {
      return targetHP?.hpMax - targetHP?.hp;
    } else {
      return hpValue;
    }
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access to healing validation: " + error);
      throw error;
    }

    logger.error("Error validating HP for user " + targetUserId + ": " + error);
    throw new Error(
      "Something went wrong. Please notify a game master of this timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

export const manaValidator = async (
  db: PrismaTransaction,
  targetUserId: string,
  manaValue: number,
) => {
  try {
    await checkActiveUserAuth();

    // if mana is subtracted, skip passive effects
    if (manaValue > 0) {
      // check if user has any mana passives to add to the mana value
      const manaBonus = await getUserPassiveEffect(
        db,
        targetUserId,
        "ManaPassive",
      );
      manaValue += manaBonus;
    }

    const targetMana = await db.user.findFirst({
      where: {
        id: targetUserId,
      },
      select: { mana: true, manaMax: true },
    });

    if (!targetMana) {
      return 0;
    }

    if (manaValue > 0) {
      if (targetMana.mana + manaValue >= targetMana.manaMax) {
        return targetMana.manaMax - targetMana.mana;
      } else {
        return manaValue;
      }
    } else {
      const newMana = targetMana.mana + manaValue;
      return newMana < 0 ? -targetMana.mana : manaValue;
    }
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access to mana validation: " + error);
      throw error;
    }

    logger.error(
      "Error validating mana for user " + targetUserId + ": " + error,
    );
    throw new Error(
      "Something went wrong. Please notify a game master of this timestamp: " +
        Date.now().toLocaleString("no-NO"),
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
  try {
    await checkActiveUserAuth();

    // if the target user is already dead, return 0
    if (targetUserHp === 0) {
      return 0;
    }

    // user has a cosmic event that increases damage
    const increasedDamage =
      (await getUserPassiveEffect(db, targetUserId, "Damage", true)) / 100;

    damage = damage * (1 + increasedDamage);

    // reduce the damage by the passive effects
    const newDamage = await protectionValidator(db, targetUserId, damage);

    // ensure the damage does not become negative
    const finalDamage = newDamage < 0 ? 0 : newDamage;

    // return the damage to take, unless it brings the user below the health treshhold, then return the damage to bring the user to the health treshold
    if (targetUserHp - finalDamage <= healthTreshold) {
      return targetUserHp - healthTreshold;
    } else {
      return finalDamage;
    }
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access to damage validation: " + error);
      throw error;
    }

    logger.error(
      "Error validating damage for user " + targetUserId + ": " + error,
    );
    throw new Error(
      "Something went wrong. Please notify a game master of this timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

// Local function to handle protection passives
const protectionValidator = async (
  db: PrismaTransaction,
  targetUserId: string,
  damage: number,
) => {
  // Get all protection passives for the user, sorted by remaining time
  const protectionPassives = await db.userPassive.findMany({
    where: {
      userId: targetUserId,
      effectType: "Protection",
    },
    orderBy: {
      endTime: "asc",
    },
  });

  let newDamage = damage;

  for (const passive of protectionPassives) {
    if (newDamage <= 0) break;

    const reducedDamage = passive.value ?? 0;
    newDamage -= reducedDamage;

    // Remove the passive after it has been used
    await db.userPassive.delete({
      where: {
        id: passive.id,
      },
    });
  }

  // Ensure the damage does not become negative
  const finalDamage = newDamage < 0 ? 0 : newDamage;

  return finalDamage;
};

export const experienceAndLevelValidator = async (
  db: PrismaTransaction,
  user: User,
  xp: number,
) => {
  try {
    await checkActiveUserAuth();

    const targetUser = await db.user.findFirst({
      where: {
        id: user.id,
      },
      select: { xp: true, level: true },
    });

    if (!targetUser) {
      return "User not found";
    }

    // ---------------- handle negative XP ---------------------
    if (xp <= 0) {
      const newXp = targetUser.xp + xp;
      const newLevel = Math.floor(newXp / 1000);
      const currentLevel = targetUser.level;
      const levelDifference = newLevel - currentLevel;

      let levelUpData = {};
      if (levelDifference < 0) {
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
          xp: { increment: xp },
          ...levelUpData,
        },
      });
      return "Successfully removed XP from user";
    }
    // ------------- handle positive XP ---------------------

    const xpMultipler =
      (await getUserPassiveEffect(db, user.id, "Experience")) / 100;
    const xpToGive = Math.round(xp * (1 + xpMultipler));

    // Calculate the new XP and level
    const newXp = targetUser.xp + xpToGive;
    const currentLevel = targetUser.level;
    const newLevel = Math.floor(newXp / 1000);
    const levelDifference = newLevel - currentLevel;

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

    if (xpToGive > 0)
      await addLog(db, user.id, `${user.username} gained ${xpToGive} XP`);

    if (levelDifference > 0) {
      await addLog(
        db,
        user.id,
        `LEVEL UP: ${user.username} leveled up to level ${targetUser.level + levelDifference}. Granting ${gemstonesOnLevelUp * levelDifference} gemstones.`,
      );
      logger.info(
        `LEVEL UP: User ${user.username} leveled up to level ${targetUser.level + levelDifference}. User recieved ${xpToGive} XP. Granting a level difference of ${levelDifference} and ${gemstonesOnLevelUp * levelDifference} gemstones.`,
      );
    }
    return "Successfully gave XP to user";
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access to experience validation: " + error);
      throw error;
    }

    logger.error("Validating experience and leveling up failed: " + error);
    return (
      "Something went wrong at " +
      Date.now().toLocaleString("no-NO") +
      " with error: " +
      error
    );
  }
};

export const goldValidator = async (
  db: PrismaTransaction,
  userId: string,
  gold: number,
) => {
  try {
    await checkActiveUserAuth();

    const targetUser = await db.user.findFirst({
      where: {
        id: userId,
      },
      select: { gold: true },
    });

    if (!targetUser) {
      throw new Error("User not found");
    }

    const goldMultipler =
      (await getUserPassiveEffect(db, userId, "Gold")) / 100;
    const goldToGive = Math.round(gold * (1 + goldMultipler));

    return goldToGive;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access to gold validation: " + error);
      throw error;
    }

    logger.error("Validating gold failed: " + error);
    throw new Error(
      "Something went wrong at " +
        Date.now().toLocaleString("no-NO") +
        " with error: " +
        error,
    );
  }
};
