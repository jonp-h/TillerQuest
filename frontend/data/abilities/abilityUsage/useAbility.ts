"use server";
// ------------------- Ability usage -------------------

import { Ability, User } from "@prisma/client";
import { db as prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { PrismaTransaction } from "@/types/prismaTransaction";
import {
  experienceAndLevelValidator,
  healingValidator,
  manaValidator,
} from "@/data/validators/validators";
import { auth } from "@/auth";

//FIXME: implement session in all functions

/**
 * Selects and uses an ability for a user on a target user.
 *
 * @param user - The user who is using the ability.
 * @param targetUserId - The ID of the target user on whom the ability is being used.
 * @param ability - The ability being used.
 * @returns A promise that resolves to a string message indicating the result of the ability usage.
 *
 * @remarks
 * - If the user's HP is 0, they cannot use abilities and a message is returned.
 * - If the user does not have enough mana to use the ability, a message is returned.
 * - Depending on the type of ability, the appropriate function is called to handle the ability usage.
 */
export const selectAbility = async (
  user: User,
  targetUsersId: string[],
  ability: Ability,
) => {
  const session = await auth();
  if (session?.user?.id !== user.id) {
    throw new Error("Not authorized");
  }

  if (user.hp === 0) {
    return "You can't use abilities while dead";
  }

  if (user.mana < (ability.manaCost || 0)) {
    return "Insufficient mana";
  }

  try {
    return await prisma.$transaction(async (db) => {
      // check if ability is AoE. If not the targetUsersId will only have one element
      if (ability.aoe) {
        return await useAOEAbility(db, user, targetUsersId, ability);
      }

      // check ability type and call the appropriate function
      switch (ability.type) {
        // heal the target
        case "Heal":
          return await useHealAbility(db, user, targetUsersId[0], ability);
        case "Revive":
          throw new Error("Revive is not implemented yet");
        // give mana to the target
        case "Mana":
          return await useManaAbility(db, user, targetUsersId[0], ability);
        // transfer a resource from one player to another player
        case "Transfer":
          return await useTransferAbility(db, user, targetUsersId[0], ability);
        case "Swap":
          throw new Error("Swap is not implemented yet");
        case "Convert":
          throw new Error("Convert is not implemented yet");
        case "Trickery":
          return "Trickery is not implemented yet";
        case "Protection":
          return await useProtectionAbility(
            db,
            user,
            targetUsersId[0],
            ability,
          );
        case "Arena":
          throw new Error("Arena is not implemented yet");
      }
    });
  } catch (error) {
    logger.error(
      "Error using" + ability.name + " by user " + user.id + ": " + error,
    );
    return (
      "Something went wrong using " +
      ability.name +
      ". Please notify a game master of this timestamp: " +
      new Date().toLocaleString()
    );
  }
};

const finalizeAbilityUsage = async (
  db: PrismaTransaction,
  user: User,
  ability: Ability,
) => {
  try {
    await experienceAndLevelValidator(db, user, ability.xpGiven!);
  } catch (error) {
    logger.error(
      "Error finalizing ability usage by user " + user.id + ": " + error,
    );
  }
};

// ---------------------------- Helper functions for AoE abilities ----------------------------

const useAOEAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  targetUsersId: string[],
  ability: Ability,
) => {
  return await Promise.all(
    targetUsersId.map(async (targetUserId) => {
      switch (ability.type) {
        // heal the target
        case "Heal":
          return await useHealAbility(db, castingUser, targetUserId, ability);
        // give mana to the target
        case "Mana":
          return await useManaAbility(db, castingUser, targetUserId, ability);
        // transfer a resource from one player to another player
        case "Transfer":
          return await useTransferAbility(
            db,
            castingUser,
            targetUserId,
            ability,
          );
        case "Arena":
          console.log("Arena is not implemented yet");
          throw new Error("Arena is not implemented yet");
      }
    }),
  );
};

// ---------------------------- Helper functions for specific ability types ----------------------------
const useHealAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  targetUserId: string,
  ability: Ability,
) => {
  try {
    // validate health to heal and passives
    let valueToHeal = await healingValidator(
      db,
      targetUserId,
      ability.value ?? 0,
    );

    if (valueToHeal === 0) {
      return "Target is already at full health";
    } else if (valueToHeal === "dead") {
      return "You can't heal a dead target. The dead require a different kind of magic.";
    } else if (typeof valueToHeal === "string") {
      return valueToHeal;
    }

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

    await finalizeAbilityUsage(db, castingUser, ability);

    logger.info(
      `User ${castingUser.id} used ability ${ability.name} on user ${targetUserId} and gained ${ability.xpGiven} XP`,
    );

    return "Target healed for " + valueToHeal;
  } catch (error) {
    logger.error("Error using heal ability: " + error);
    return (
      "Something went wrong. Please notify a game master of this timestamp: " +
      Date.now()
    );
  }
};

const useManaAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  targetUserId: string,
  ability: Ability,
) => {
  // validate mana value and passives
  try {
    let value = await manaValidator(db, targetUserId, ability.value!);

    // if the value is a string, it's an error message
    if (typeof value === "string") {
      return value;
    }
    await db.user.update({
      where: {
        id: targetUserId,
      },
      data: {
        mana: {
          increment: value,
        },
      },
    });

    await finalizeAbilityUsage(db, castingUser, ability);

    logger.info(
      `User ${castingUser.id} used ability ${ability.name} on user ${targetUserId} and gained ${ability.xpGiven} XP`,
    );

    return "Target given " + value + " mana";
  } catch (error) {
    logger.error("Error using mana ability: " + error);
    return (
      "Something went wrong. Please notify a game master of this timestamp: " +
      Date.now()
    );
  }
};

const useTransferAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  targetUserId: string,
  ability: Ability,
) => {
  try {
    // if the ability costs health, the ability trades health. Otherwise, it trades mana
    const fieldToUpdate = ability.healthCost ? "hp" : "mana";
    // validate value and passives
    let value = ability.value;
    if (fieldToUpdate === "hp") {
      let targetUser = await healingValidator(db, targetUserId, ability.value!);
      // check if user is dead and return error message
      if (typeof targetUser === "string") {
        return targetUser;
      }
      value = targetUser;
    } else {
      let targetUser = await manaValidator(db, targetUserId, ability.value!);
      // return error message if user cannot recieve mana
      if (typeof targetUser === "string") {
        return targetUser;
      }
      value = targetUser;
    }

    await db.user.update({
      where: {
        id: targetUserId,
      },
      data: {
        [fieldToUpdate]: {
          increment: value,
        },
      },
    });

    await finalizeAbilityUsage(db, castingUser, ability);

    logger.info(
      `User ${castingUser.id} used ability ${ability.name} on user ${targetUserId} and gained ${ability.xpGiven} XP`,
    );

    return "Target given " + value + " from your " + fieldToUpdate;
  } catch (error) {
    logger.error("Error using transfer ability " + error);
    return (
      "Something went wrong. Please notify a game master of this timestamp: " +
      Date.now()
    );
  }
};

const useProtectionAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  targetUserId: string,
  ability: Ability,
) => {
  try {
    // check if user already has passive
    let targetHasPassive = await db.userPassive.findFirst({
      where: {
        userId: targetUserId,
        abilityName: ability.name,
      },
    });

    if (targetHasPassive) {
      return "Target already has this passive";
    }

    await db.userPassive.create({
      data: {
        userId: targetUserId,
        effectType: ability.type,
        abilityName: ability.name,
        value: ability.value ?? 0,
        endTime: ability.duration
          ? new Date(Date.now() + ability.duration * 60000).toISOString()
          : undefined, // 1 * 60000 = 1 minute
      },
    });

    logger.info(
      `User ${castingUser.id} used ability ${ability.name} on user ${targetUserId} and gained ${ability.xpGiven} XP`,
    );

    return "Target recieved " + ability.name;
  } catch (error) {
    logger.error("Error using protection ability: " + error);
    return (
      "Something went wrong. Please notify a game master of this timestamp: " +
      Date.now()
    );
  }
};
