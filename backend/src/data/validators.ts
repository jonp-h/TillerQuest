import { $Enums, Prisma, PrismaClient, User } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";

type PrismaTransaction = Omit<
  PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

/**
 * Retrieves the passive value for a specific user, based on passive type. Returns all the values added together.
 *
 * @param userId - The ID of the user.
 * @param type - The type of the passive.
 * @returns The value of the passive of a given type, or 0 if no passive is found.
 */
const getUserPassiveEffect = async (
  db: PrismaTransaction,
  userId: string,
  type: $Enums.AbilityType
) => {
  try {
    const userPassives = await db.userPassive.findMany({
      where: {
        userId,
        effectType: type as $Enums.AbilityType,
      },
    });

    if (!userPassives) {
      return 0;
    }

    let value = 0;
    userPassives.map((effect) => {
      value += effect.value ?? 0;
    });

    return value;
  } catch (error) {
    console.error("Error getting user passive by type " + type + ": " + error);
    return 0;
  }
};

export const healingValidator = async (
  db: PrismaTransaction,
  targetUserId: string,
  hpValue: number
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
    console.error(
      "Error validating HP for user " + targetUserId + ": " + error
    );
    return (
      "Something went wrong. Please notify a game master of this timestamp: " +
      Date.now()
    );
  }
};

export const manaValidator = async (
  db: PrismaTransaction,
  targetUserId: string,
  manaValue: number
) => {
  // check if user has any mana passives to add to the mana value
  const manaBonus = await getUserPassiveEffect(db, targetUserId, "ManaPassive");
  manaValue += manaBonus;

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
  damage: number,
  healthTreshold: number = 0
) => {
  const targetUser = await db.user.findFirst({
    where: {
      id: targetUserId,
    },
    select: { hp: true },
  });

  if (!targetUser) {
    return 0;
  }

  // reduce the damage by the passive effects
  const reducedDamage = await getUserPassiveEffect(
    db,
    targetUserId,
    "Protection"
  );
  const newDamage = damage - reducedDamage;

  // ensure the damage does not become negative
  const finalDamage = newDamage < 0 ? 0 : newDamage;

  // return the damage to take, unless it brings the user below the health treshhold, then return the damage to bring the user to the health treshold
  if (targetUser.hp - finalDamage <= healthTreshold) {
    return targetUser.hp - healthTreshold;
  } else {
    return finalDamage;
  }
};

export const experienceAndLevelValidator = async (
  db: PrismaTransaction,
  userId: string,
  xp: number
) => {
  try {
    const user = await db.user.findFirst({
      where: {
        id: userId,
      },
      select: { id: true, xp: true, level: true },
    });
    if (!user) {
      return;
    }
    const xpMultipler =
      (await getUserPassiveEffect(db, user.id, "Experience")) / 100;
    const xpToGive = Math.round(xp * (1 + xpMultipler));
    const levelDifference =
      Math.floor((user.xp + xpToGive) / 1000) - user.level;

    let levelUpData = {};
    if (levelDifference > 0) {
      levelUpData = {
        level: { increment: levelDifference },
        gemstones: {
          // TODO: add reference to gamesettings file in backend
          increment: 2 * levelDifference,
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
      console.info(
        `LEVEL UP: User ${user.id} leveled up to level ${
          user.level + levelDifference
        }. User recieved ${xpToGive} XP. Granting a level difference of ${levelDifference} and ${
          2 * levelDifference
        } gemstones.`
      );
    }
    return "Successfully gave XP to user";
  } catch (error) {
    console.error("Validating experience and leveling up failed: " + error);
    return "Something went wrong at " + Date.now() + " with error: " + error;
  }
};
