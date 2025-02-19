"use server";

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
import { getUserPassiveEffect } from "@/data/passives/getPassive";

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
  userId: string,
  targetUsersIds: string[],
  ability: Ability,
) => {
  const session = await auth();
  if (session?.user?.id !== userId) {
    throw new Error("Not authorized");
  }

  const castingUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!castingUser) {
    throw new Error("Something went wrong. Please notify a game master.");
  }

  if (castingUser.hp === 0) {
    return "You can't use abilities while dead";
  }

  const cosmic = await prisma.cosmicEvent.findFirst({
    where: {
      selected: true,
    },
    select: {
      increaseCostType: true,
      blockAbilityType: true,
    },
  });

  if (cosmic?.blockAbilityType === ability.type) {
    return "This ability is blocked by a cosmic event";
  }

  // check if the user has a cosmic event passive that increases the cost. If the type is all, all abilities cost more
  const increasedCostType =
    cosmic?.increaseCostType === "All" ? "All" : ability.type;
  const increasedCost =
    (await getUserPassiveEffect(
      prisma,
      castingUser.id,
      increasedCostType,
      true,
    )) / 100;

  ability.manaCost = ability.manaCost! * (1 + increasedCost);
  ability.healthCost = ability.healthCost! * (1 + increasedCost);

  if (castingUser.mana < (ability.manaCost || 0)) {
    return "Insufficient mana. The cost is " + ability.manaCost;
  }
  if (castingUser.hp <= (ability.healthCost || 0)) {
    return "Insufficient health. The cost is " + ability.healthCost;
  }

  try {
    return await prisma.$transaction(async (db) => {
      // check ability type and call the appropriate function
      switch (ability.type) {
        // ---------------------------- Passive abilities ----------------------------

        case "IncreaseHealth":
          return await usePassive(db, castingUser, targetUsersIds, ability);

        case "IncreaseMana":
          return await usePassive(db, castingUser, targetUsersIds, ability);

        case "ManaPassive": // give mana passive to target
          return await usePassive(db, castingUser, targetUsersIds, ability);

        case "Health":
          return await usePassive(db, castingUser, targetUsersIds, ability);

        case "Experience":
          return await usePassive(db, castingUser, targetUsersIds, ability);

        case "Trickery":
          if (ability.name === "Evade") {
            return useEvadeAbility(db, castingUser, ability);
          }
          return await usePassive(db, castingUser, targetUsersIds, ability);

        case "Postpone":
          return await usePassive(db, castingUser, targetUsersIds, ability);

        case "Experience":
          return await usePassive(db, castingUser, targetUsersIds, ability);

        // ---------------------------- Active abilities ----------------------------

        case "Heal": // heal the target
          return await useHealAbility(db, castingUser, targetUsersIds, ability);

        case "Revive": // revive a dead target without negative consequences
          return await useReviveAbility(
            db,
            castingUser,
            targetUsersIds,
            ability,
          );

        case "Mana": // give mana to the target
          return await useManaAbility(db, castingUser, targetUsersIds, ability);

        case "Transfer": // transfer a resource from one player to another player
          return await useTransferAbility(
            db,
            castingUser,
            targetUsersIds,
            ability,
          );

        case "Swap": // swap a resource between two players
          return await useSwapAbility(
            db,
            castingUser,
            targetUsersIds[0],
            ability,
          );

        // TODO: validate to only target self?
        case "Trade": // converts a resource from one type to another
          return await useTradeAbility(
            db,
            castingUser,
            targetUsersIds[0],
            ability,
          );

        case "Protection": // shields a target from damage
          return await useProtectionAbility(
            db,
            castingUser,
            targetUsersIds,
            ability,
          );

        case "Arena":
          return await useArenaAbility(
            db,
            castingUser,
            targetUsersIds,
            ability,
          );

        case "XP":
          return await useXPAbility(db, castingUser, ability);
      }
    });
  } catch (error) {
    logger.error(
      "Error using " +
        ability.name +
        " by user " +
        castingUser.username +
        " on targets " +
        targetUsersIds +
        ": " +
        error,
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
  // decrement cost of ability from user
  await db.user.update({
    where: {
      id: user.id,
    },
    data: {
      mana: {
        decrement: ability.manaCost || 0,
      },
      hp: {
        decrement: ability.healthCost || 0,
      },
    },
  });

  await experienceAndLevelValidator(db, user, ability.xpGiven!);
};

// ---------------------------- Helper function for passive abilities ----------------------------

const usePassive = async (
  db: PrismaTransaction,
  castingUser: User,
  targetUsersIds: string[],
  ability: Ability,
) => {
  await Promise.all(
    targetUsersIds.map(async (targetUserId) => {
      let targetHasPassive = await db.userPassive.findFirst({
        where: {
          userId: targetUserId,
          abilityName: ability.name,
        },
      });

      if (targetHasPassive) {
        throw new Error("Target already has this passive");
      }

      // return db.$transaction(async (db) => {
      // if the ability duration is undefined, create a counter from the current time for 600000ms (10 minutes)
      await db.userPassive.create({
        data: {
          userId: targetUserId,
          effectType: ability.type,
          passiveName: ability.name,
          abilityName: ability.name,
          icon: ability.icon,
          value: ability.value ?? 0,
          endTime: ability.duration
            ? new Date(Date.now() + ability.duration * 60000).toISOString()
            : undefined, // 1 * 60000 = 1 minute
        },
      });

      if (ability.type === "IncreaseHealth") {
        await db.user.update({
          where: {
            id: targetUserId,
          },
          data: {
            hpMax: {
              increment: ability.value ?? 0,
            },
          },
        });
      } else if (ability.type === "IncreaseMana") {
        await db.user.update({
          where: {
            id: targetUserId,
          },
          data: {
            manaMax: {
              increment: ability.value ?? 0,
            },
          },
        });
      }
      await finalizeAbilityUsage(db, castingUser, ability);
      return "Activated " + ability.name + "!";
    }),
  );
};

// ---------------------------- Helper functions for specific ability types ----------------------------
const useHealAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  targetUsersIds: string[],
  ability: Ability,
) => {
  const results = await Promise.all(
    targetUsersIds.map(async (targetUserId) => {
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
      return "Healed " + valueToHeal + " health";
    }),
  );

  logger.info(
    `User ${castingUser.id} used ability ${ability.name} on users ${targetUsersIds} and gained ${ability.xpGiven} XP`,
  );

  return results.toString();
};

const useReviveAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  targetUserIds: string[],
  ability: Ability,
) => {
  const targetUser = await db.user.findUnique({
    where: {
      id: targetUserIds[0],
    },
  });

  if (!targetUser || targetUser.hp > 0) {
    return "Target is not dead";
  }

  await db.user.update({
    where: {
      id: targetUser.id,
    },
    data: {
      hp: 1,
    },
  });

  logger.info(
    `User ${castingUser.id} used ability ${ability.name} on user ${targetUserIds} and gained ${ability.xpGiven} XP`,
  );

  await finalizeAbilityUsage(db, castingUser, ability);
  return "Successfully revived the target without negative consequences";
};

const useManaAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  targetUserIds: string[],
  ability: Ability,
) => {
  // validate mana value and passives
  const results = await Promise.all(
    targetUserIds.map(async (targetUserId) => {
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
      return "Successfully gave " + value + " mana";
    }),
  );

  logger.info(
    `User ${castingUser.id} used ability ${ability.name} on user ${targetUserIds} and gained ${ability.xpGiven} XP`,
  );

  await finalizeAbilityUsage(db, castingUser, ability);
  return results.toString();
};

const useTransferAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  targetUserIds: string[],
  ability: Ability,
) => {
  const results = await Promise.all(
    targetUserIds.map(async (targetUserId) => {
      // if the ability costs health, the ability trades health. Otherwise, it trades mana
      const fieldToUpdate = ability.healthCost ? "hp" : "mana";
      // validate value and passives
      let value = ability.value;
      if (fieldToUpdate === "hp") {
        let targetUser = await healingValidator(
          db,
          targetUserId,
          ability.value!,
        );
        // check if user is dead and return error message
        if (typeof targetUser === "string") {
          return targetUser;
        }
        value = targetUser;
      } else {
        let targetUser = await manaValidator(db, targetUserId, ability.value!);
        // return error message if user cannot recieve mana
        if (targetUser === 0) {
          return "Target is already at full mana";
        } else if (typeof targetUser === "string") {
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
      return "Target given " + ability.value + " " + fieldToUpdate;
    }),
  );

  logger.info(
    `User ${castingUser.id} used ability ${ability.name} on user ${targetUserIds} and gained ${ability.xpGiven} XP`,
  );

  return results.toString();
};

const useSwapAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  targetUserId: string,
  ability: Ability,
) => {
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

  logger.info(
    `User ${castingUser.id} used ability ${ability.name} on user ${targetUserId} and gained ${ability.xpGiven} XP`,
  );

  await finalizeAbilityUsage(db, castingUser, ability);
  return "You swapped health with the target";
};

const useTradeAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  targetUserId: string,
  ability: Ability,
) => {
  console.log("casting user hp is: " + castingUser.hp);

  // At the moment the trade ability is only used to trade health to mana
  const manaValue = await manaValidator(db, targetUserId, ability.value!);

  if (manaValue === 0) {
    return "Target is already at full mana";
  }

  await db.user.update({
    where: {
      id: targetUserId,
    },
    data: {
      mana: {
        increment: manaValue,
      },
    },
  });

  logger.info(
    `User ${castingUser.id} used ability ${ability.name} and gained ${ability.xpGiven} XP`,
  );

  await finalizeAbilityUsage(db, castingUser, ability);
  return (
    "You traded " +
    ability.healthCost +
    " health, and recieved " +
    manaValue +
    " mana"
  );
};

const useProtectionAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  targetUserIds: string[],
  ability: Ability,
) => {
  const results = await Promise.all(
    targetUserIds.map(async (targetUserId) => {
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
          passiveName: ability.name,
          abilityName: ability.name,
          value: ability.value ?? 0,
          endTime: ability.duration
            ? new Date(Date.now() + ability.duration * 60000).toISOString()
            : undefined, // 1 * 60000 = 1 minute
        },
      });

      return "Target recieved " + ability.name;
    }),
  );

  logger.info(
    `User ${castingUser.id} used ability ${ability.name} on user ${targetUserIds} and gained ${ability.xpGiven} XP`,
  );

  await finalizeAbilityUsage(db, castingUser, ability);
  return results.toString();
};

const useXPAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  ability: Ability,
) => {
  logger.info(
    `User ${castingUser.id} used ability ${ability.name} on themselves and gained ${ability.xpGiven} XP`,
  );

  await finalizeAbilityUsage(db, castingUser, ability);
  return "You gained " + ability.xpGiven + " XP";
};

const useArenaAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  targetUserIds: string[],
  ability: Ability,
) => {
  await Promise.all(
    targetUserIds.map(async (targetUserId) => {
      await db.user.update({
        where: {
          id: targetUserId,
        },
        data: {
          arenaTokens: {
            increment: ability.value!,
          },
        },
      });
    }),
  );

  logger.info(
    `User ${castingUser.id} used ability ${ability.name} on user ${targetUserIds} and gained ${ability.xpGiven} XP`,
  );

  await finalizeAbilityUsage(db, castingUser, ability);
  return "Guild recieved " + ability.value + " arena tokens";
};

// ---------------------------- Helper functions for specific ability types ----------------------------

const useEvadeAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  ability: Ability,
) => {
  // checks if user has passive, decrements cost and gives xp
  await usePassive(db, castingUser, [castingUser.id], ability);

  await db.userPassive.deleteMany({
    where: {
      userId: castingUser.id,
      cosmicEvent: true,
    },
  });

  await db.userAbility.deleteMany({
    where: {
      userId: castingUser.id,
      fromCosmic: true,
    },
  });

  logger.info(
    `User ${castingUser.id} evaded daily cosmic event and gained ${ability.xpGiven} XP`,
  );

  return "Cosmic event evaded!";
};
