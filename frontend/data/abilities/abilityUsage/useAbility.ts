"use server";
// ------------------- Ability usage -------------------

import { Ability, User } from "@prisma/client";
import { db as prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { PrismaTransaction } from "@/types/prismaTransaction";
import {
  damageValidator,
  experienceAndLevelValidator,
  healingValidator,
  manaValidator,
} from "@/data/validators/validators";
import { auth } from "@/auth";
import { getUserPassiveEffect } from "@/data/passives/getPassive";
import { usePassive } from "@/data/passives/usePassive";

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
  targetUsersId: string[] = [],
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
  if (user.hp < (ability.healthCost || 0)) {
    return "Insufficient health";
  }

  try {
    return await prisma.$transaction(async (db) => {
      // check if ability is AoE. If not the targetUsersId will only have one element
      if (ability.target > 1) {
        return await useAOEAbility(db, user, targetUsersId, ability);
      }

      if (ability.target === -1) {
        return usePassive(db, user, ability);
      }

      // check ability type and call the appropriate function
      switch (ability.type) {
        // heal the target
        case "Heal":
          return await useHealAbility(db, user, targetUsersId[0], ability);
        // revive a dead target without negative consequences
        case "Revive":
          throw new Error("Revive is not implemented yet");
        // give mana to the target
        case "Mana":
          return await useManaAbility(db, user, targetUsersId[0], ability);
        // transfer a resource from one player to another player
        case "Transfer":
          return await useTransferAbility(db, user, targetUsersId[0], ability);
        // swap a resource between two players
        case "Swap":
          return await useSwapAbility(db, user, targetUsersId[0], ability);
        // converts a resource from one type to another
        case "Trade":
          return await useTradeAbility(db, user, targetUsersId[0], ability);
        case "Trickery":
          throw new Error("Trickery is not implemented yet");
        // shields a target from damage
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
      new Date().toISOString()
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
      new Date().toISOString()
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
      new Date().toISOString()
    );
  }
};

const useSwapAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  targetUserId: string,
  ability: Ability,
) => {
  try {
    const targetUser = await db.user.findUnique({
      where: {
        id: targetUserId,
      },
      select: {
        hp: true,
        hpMax: true,
      },
    });
    if (!targetUser || targetUser.hp === 0) {
      return "Target is dead";
    }

    if (castingUser.hp < targetUser.hp) {
      return "You cannot swap health with a target that has more health than you";
    }

    // swap should not exceed the max health of the users
    const newHealthForTarget =
      castingUser.hp > targetUser?.hpMax ? targetUser.hpMax : castingUser.hp;
    const newHealthForCastingUser =
      targetUser.hp > castingUser.hpMax ? castingUser.hpMax : targetUser.hp;

    await db.user.update({
      where: {
        id: castingUser.id,
      },
      data: {
        hp: newHealthForCastingUser,
      },
    });

    await db.user.update({
      where: {
        id: targetUserId,
      },
      data: {
        hp: newHealthForTarget,
      },
    });

    await finalizeAbilityUsage(db, castingUser, ability);

    logger.info(
      `User ${castingUser.id} used ability ${ability.name} on user ${targetUserId} and gained ${ability.xpGiven} XP`,
    );

    return "You swapped health with the target";
  } catch (error) {
    logger.error("Error using swap ability: " + error);
    return (
      "Something went wrong. Please notify a game master of this timestamp: " +
      new Date().toISOString()
    );
  }
};

const useTradeAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  targetUserId: string,
  ability: Ability,
) => {
  try {
    // At the moment the trade ability is only used to trade health to mana
    let value = await damageValidator(
      db,
      targetUserId,
      castingUser.hp,
      ability.healthCost!,
    );
    const passiveMana = await getUserPassiveEffect(db, targetUserId, "Mana");
    const manaToRecieve = value + passiveMana;

    await db.user.update({
      where: {
        id: targetUserId,
      },
      data: {
        hp: {
          decrement: value,
        },
        mana: {
          increment: manaToRecieve,
        },
      },
    });

    await finalizeAbilityUsage(db, castingUser, ability);

    logger.info(
      `User ${castingUser.id} used ability ${ability.name} and gained ${ability.xpGiven} XP`,
    );

    return (
      "You traded " + value + " health, and recieved " + manaToRecieve + " mana"
    );
  } catch (error) {
    logger.error("Error using trade ability: " + error);
    return (
      "Something went wrong. Please notify a game master of this timestamp: " +
      new Date().toISOString()
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

    await finalizeAbilityUsage(db, castingUser, ability);

    logger.info(
      `User ${castingUser.id} used ability ${ability.name} on user ${targetUserId} and gained ${ability.xpGiven} XP`,
    );

    return "Target recieved " + ability.name;
  } catch (error) {
    logger.error("Error using protection ability: " + error);
    return (
      "Something went wrong. Please notify a game master of this timestamp: " +
      new Date().toISOString()
    );
  }
};
