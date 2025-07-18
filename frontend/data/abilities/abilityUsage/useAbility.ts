"use server";

import { $Enums, Ability, User } from "@prisma/client";
import { db as prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { PrismaTransaction } from "@/types/prismaTransaction";
import {
  experienceAndLevelValidator,
  healingValidator,
  manaValidator,
} from "@/data/validators/validators";
import { getUserPassiveEffect } from "@/data/passives/getPassive";
import { addLog } from "@/data/log/addLog";
import { DiceRoll, exportFormats } from "@dice-roller/rpg-dice-roller";
import { ErrorMessage } from "@/lib/error";
import { AuthorizationError, checkUserIdAndActiveAuth } from "@/lib/authUtils";
import { addAnalytics } from "@/data/analytics/analytics";

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
  abilityName: string,
) => {
  try {
    await checkUserIdAndActiveAuth(userId);

    const castingUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!castingUser) {
      throw new ErrorMessage(
        "Something went wrong. Please notify a game master.",
      );
    }

    if (castingUser.hp === 0) {
      throw new ErrorMessage("You can't use abilities while dead");
    }

    const ability = await prisma.ability.findFirst({
      where: {
        name: abilityName,
      },
    });

    if (!ability) {
      throw new ErrorMessage("Ability not found");
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
      throw new ErrorMessage("This ability is blocked by a cosmic event");
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
      throw new ErrorMessage(
        "Insufficient mana. The cost is " + ability.manaCost,
      );
    }
    if (castingUser.hp <= (ability.healthCost || 0)) {
      throw new ErrorMessage(
        "Insufficient health. The cost is " + ability.healthCost,
      );
    }

    return await prisma.$transaction(async (db) => {
      // check ability type and call the appropriate function
      switch (ability.type) {
        // ---------------------------- Passive abilities ----------------------------
        // TODO: make passives default in switch case
        case "IncreaseHealth":
          return await activatePassive(
            db,
            castingUser,
            targetUsersIds,
            ability,
          );

        case "IncreaseMana":
          return await activatePassive(
            db,
            castingUser,
            targetUsersIds,
            ability,
          );

        case "DecreaseHealth":
          return await useDecreaseHealthAbility(
            db,
            castingUser,
            targetUsersIds[0],
            ability,
          );

        case "DailyMana": // gives daily mana to the target
          return await activatePassive(
            db,
            castingUser,
            targetUsersIds,
            ability,
          );

        case "ManaPassive": // gives extra mana to the target on every mana granting ability
          return await activatePassive(
            db,
            castingUser,
            targetUsersIds,
            ability,
          );

        case "Health":
          return await activatePassive(
            db,
            castingUser,
            targetUsersIds,
            ability,
          );

        case "Experience":
          return await activatePassive(
            db,
            castingUser,
            targetUsersIds,
            ability,
          );

        case "ArenaToken":
          return await activatePassive(
            db,
            castingUser,
            targetUsersIds,
            ability,
          );

        case "Trickery":
          if (ability.name === "Evade") {
            return await useEvadeAbility(db, castingUser, ability);
          } else if (ability.name === "Twist-of-Fate") {
            return await useTwistOfFateAbility(db, castingUser, ability);
          }
          return await activatePassive(
            db,
            castingUser,
            targetUsersIds,
            ability,
          );

        case "Postpone":
          return await activatePassive(
            db,
            castingUser,
            targetUsersIds,
            ability,
          );

        case "Experience":
          return await activatePassive(
            db,
            castingUser,
            targetUsersIds,
            ability,
          );
        case "ManaShield":
          return await activatePassive(
            db,
            castingUser,
            targetUsersIds,
            ability,
          );
        case "GoldPassive":
          return await activatePassive(
            db,
            castingUser,
            targetUsersIds,
            ability,
          );
        case "TurnPassive":
          // TODO: considering moving this. Required to give immediate turns to the user
          await db.user.update({
            where: {
              id: castingUser.id,
            },
            data: {
              turns: {
                increment: 1,
              },
            },
          });
          return await activatePassive(
            db,
            castingUser,
            targetUsersIds,
            ability,
          );
        case "Access":
          return await useAccessAbility(
            db,
            castingUser,
            targetUsersIds,
            ability,
          );

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

        case "Gold":
          return await useGoldAbility(db, castingUser, targetUsersIds, ability);

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
        case "Turns":
          return await useTurnsAbility(
            db,
            castingUser,
            targetUsersIds,
            ability,
          );

        case "XP":
          return await useXPAbility(db, castingUser, ability);

        default:
          throw new ErrorMessage("Unknown ability");
      }
    });
  } catch (error) {
    // if the error is an instance of AuthError, it means the user does not have the required permissions
    if (error instanceof AuthorizationError) {
      logger.warn(`Auth violation: ${error.message}`);
      return error.userMessage || "Access denied";
    }

    // if the error is an instance of ErrorMessage, the message can be returned directly
    if (error instanceof ErrorMessage) {
      return error.message;
    }
    logger.error(
      "Error using " +
        abilityName +
        " by user " +
        userId +
        " on targets " +
        targetUsersIds +
        ": " +
        error,
    );
    return (
      "Something went wrong using " +
      abilityName +
      ". Please notify a game master of this timestamp: " +
      new Date().toLocaleString("no-NO")
    );
  }
};

const finalizeAbilityUsage = async (
  db: PrismaTransaction,
  user: User,
  ability: Ability,
) => {
  // should not be able to kill yourself with an ability
  if (ability.healthCost && user.hp - ability.healthCost <= 0) {
    throw new ErrorMessage("You don't have enough hp to use this ability!");
  }

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

  await addLog(db, user.id, `${user.username} used ${ability.name}`);
  if (ability.xpGiven)
    await experienceAndLevelValidator(db, user, ability.xpGiven!);

  await addAnalytics(db, user.id, "ability_use", {
    category: ability.category,
    abilityId: ability.id,

    hpChange: -(ability.healthCost || 0),
    manaChange: -(ability.manaCost || 0),
    xpChange: ability.xpGiven || 0,
    manaCost: ability.manaCost || 0,
    healthCost: ability.healthCost || 0,
    gemstoneCost: ability.gemstoneCost || 0,
    userLevel: user.level || 0,
    userClass: user.class || "",
    guildName: user.guildName || "",
  });
};

// ---------------------------- Helper function for passive abilities ----------------------------

const activatePassive = async (
  db: PrismaTransaction,
  castingUser: User,
  targetUsersIds: string[],
  ability: Ability,
) => {
  const abilityValue = getAbilityValue(ability);

  await Promise.all(
    targetUsersIds.map(async (targetUserId) => {
      const targetHasPassive = await db.userPassive.findFirst({
        where: {
          userId: targetUserId,
          abilityName: ability.name,
        },
      });

      // if the target is single and already has the passive, return an error message
      if (targetHasPassive && targetUsersIds.length === 1) {
        throw new ErrorMessage("Target already has this passive");
      }
      // if there are multiple targets and one of them has the passive, replace it with a new one
      else if (targetHasPassive?.abilityName && targetUsersIds.length > 1) {
        await db.userPassive.delete({
          where: {
            userId_abilityName: {
              userId: targetUserId,
              abilityName: targetHasPassive.abilityName,
            },
          },
        });
      }

      // if the ability decreases health or mana, the value should be set to the cost
      if (ability.type === "DecreaseHealth") {
        abilityValue.total = ability.healthCost!;
      } else if (ability.type === "DecreaseMana") {
        abilityValue.total = ability.manaCost!;
      }

      // if the ability duration is not undefined, create a counter from the current time for 600000ms (10 minutes)
      await db.userPassive.create({
        data: {
          userId: targetUserId,
          effectType: ability.type,
          passiveName: ability.name,
          abilityName: ability.name,
          icon: ability.icon,
          value: abilityValue.total,
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
      } else if (ability.type === "DecreaseHealth") {
        await db.user.update({
          where: {
            id: targetUserId,
          },
          data: {
            hpMax: {
              decrement: ability.healthCost ?? 0,
            },
          },
        });
      } else if (ability.type === "DecreaseMana") {
        await db.user.update({
          where: {
            id: targetUserId,
          },
          data: {
            manaMax: {
              decrement: ability.manaCost ?? 0,
            },
          },
        });
      }
    }),
  );
  await finalizeAbilityUsage(db, castingUser, ability);
  return {
    message: ability.diceNotation
      ? "You rolled " +
        abilityValue.total +
        ". " +
        ability.name.replace(/-/g, " ") +
        " activated!"
      : "Activated " + ability.name.replace(/-/g, " ") + "!",
    diceRoll:
      "output" in abilityValue
        ? abilityValue.output.split("[")[1].split("]")[0]
        : "",
  };
};

/**
 * Calculates the value of an ability for a user.
 *
 * @param ability - The ability being used.
 * @param user - The user who is using the ability.
 * @returns An object containing the total value of the ability.
 *
 * @remarks
 * - If the ability has a static value, that value is returned.
 * - If the ability has a dice notation, the value is calculated based on the dice roll.
 * - If the ability does not have a value or dice notation, a total value of 0 is returned.
 */
const getAbilityValue = (ability: Ability) => {
  // if an ability has a static value, return it.
  if (ability.value) {
    return { total: ability.value };
  }

  if (!ability.diceNotation) {
    return { total: 0 };
  }
  const roll = new DiceRoll(ability.diceNotation);
  // @ts-expect-error - the package's export function is not typed correctly
  return roll.export(exportFormats.OBJECT) as {
    averageTotal: number;
    maxTotal: number;
    minTotal: number;
    notation: string;
    output: string;
    // rolls: any[];
    total: number;
    type: string;
  };
};

/**
 * Uses an ability that grants access to a feature or area.
 *
 * @param db - The Prisma transaction object.
 * @param castingUser - The user who is using the ability.
 * @param targetUsersIds - The IDs of the users who are the targets of the ability.
 * @param ability - The ability being used.
 * @returns A message indicating the result of the ability usage.
 */
const useAccessAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  targetUsersIds: string[],
  ability: Ability,
) => {
  await Promise.all(
    targetUsersIds.map(async (targetUserId) => {
      // validate access
      const userAccess = await db.user.findUnique({
        where: {
          id: targetUserId,
        },
        select: {
          access: true,
        },
      });

      // names are written with slug format, but enum is in camelCase
      const accessName = ability.name.replace(/-/g, "") as $Enums.Access;
      if (userAccess?.access.includes(accessName)) {
        throw new ErrorMessage("User already has access to this feature");
      }

      // apply ability effects
      await db.user.update({
        where: {
          id: targetUserId,
        },
        data: {
          access: {
            push: accessName,
          },
        },
      });
    }),
  );

  await activatePassive(db, castingUser, targetUsersIds, ability);
  return {
    message: "Granted access to " + ability.name.replace(/-/g, " ") + "!",
    diceRoll: "",
  };
};

// ---------------------------- Helper functions for specific ability types ----------------------------
const useHealAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  targetUsersIds: string[],
  ability: Ability,
) => {
  const abilityValue = getAbilityValue(ability);

  await Promise.all(
    targetUsersIds.map(async (targetUserId) => {
      // validate health to heal and passives
      const valueToHeal = await healingValidator(
        db,
        targetUserId,
        abilityValue.total,
      );

      if (valueToHeal === 0 && targetUsersIds.length === 1) {
        throw new ErrorMessage("Target is already at full health");
      } else if (
        valueToHeal === "User is dead" &&
        targetUsersIds.length === 1
      ) {
        throw new ErrorMessage(
          "You can't heal a dead target. The dead require a different kind of magic.",
        );
      } else if (typeof valueToHeal === "string") {
        throw new ErrorMessage(valueToHeal);
      }

      const targetUser = await db.user.update({
        where: {
          id: targetUserId,
        },
        data: {
          hp: {
            increment: valueToHeal,
          },
        },
        select: {
          username: true,
        },
      });
      await addLog(
        db,
        targetUserId,
        `${targetUser.username} was healed for ${valueToHeal} by ${castingUser.username}`,
      );
    }),
  );

  await finalizeAbilityUsage(db, castingUser, ability);
  logger.info(
    `User ${castingUser.username} used ability ${ability.name} on users ${targetUsersIds} and gained ${ability.xpGiven} XP`,
  );

  return {
    message: "Healed " + abilityValue.total + " successfully",
    diceRoll:
      "output" in abilityValue
        ? abilityValue.output.split("[")[1].split("]")[0]
        : "",
  };
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
    throw new ErrorMessage("Target is not dead");
  }

  const target = await db.user.update({
    where: {
      id: targetUser.id,
    },
    data: {
      hp: 1,
    },
    select: {
      username: true,
    },
  });

  logger.info(
    `User ${castingUser.username} used ability ${ability.name} on user ${targetUserIds} and gained ${ability.xpGiven} XP`,
  );

  await addLog(
    db,
    targetUser.id,
    `REVIVAL: ${castingUser.username} revived ${target.username}`,
  );
  await finalizeAbilityUsage(db, castingUser, ability);
  return {
    message: "Successfully revived the target without negative consequences",
    diceRoll: "",
  };
};

const useManaAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  targetUserIds: string[],
  ability: Ability,
) => {
  const abilityValue = getAbilityValue(ability);

  await Promise.all(
    targetUserIds.map(async (targetUserId) => {
      // validate mana value and passives
      const value = await manaValidator(db, targetUserId, abilityValue.total);

      // if the value is a string, it's an error message
      if (value === 0 && targetUserIds.length === 1) {
        throw new ErrorMessage("Target is already at max mana");
      } else if (typeof value === "string") {
        throw new ErrorMessage(value);
      }
      const targetUser = await db.user.update({
        where: {
          id: targetUserId,
        },
        data: {
          mana: {
            increment: value,
          },
        },
        select: {
          username: true,
        },
      });
      await addLog(
        db,
        targetUserId,
        `${targetUser.username} recieved ${value} mana from ${castingUser.username}`,
      );
    }),
  );

  logger.info(
    `User ${castingUser.username} used ability ${ability.name} on user ${targetUserIds} and gained ${ability.xpGiven} XP`,
  );

  await finalizeAbilityUsage(db, castingUser, ability);
  return {
    message: "Gave " + abilityValue.total + " mana",
    diceRoll:
      "output" in abilityValue
        ? abilityValue.output.split("[")[1].split("]")[0]
        : "",
  };
};

const useTransferAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  targetUserIds: string[],
  ability: Ability,
) => {
  const abilityValue = getAbilityValue(ability);
  // if the ability costs health, the ability trades health. Otherwise, it trades mana
  const fieldToUpdate = ability.healthCost ? "hp" : "mana";

  await Promise.all(
    targetUserIds.map(async (targetUserId) => {
      // validate value and passives
      if (fieldToUpdate === "hp") {
        const targetUser = await healingValidator(
          db,
          targetUserId,
          abilityValue.total,
        );
        // check if user is dead and return error message
        if (typeof targetUser === "string") {
          throw new ErrorMessage(targetUser);
        }
        abilityValue.total = targetUser;
      } else {
        const targetUser = await manaValidator(
          db,
          targetUserId,
          abilityValue.total,
        );
        // return error message if user cannot recieve mana
        if (targetUser === 0) {
          throw new ErrorMessage("Target is already at full mana");
        } else if (typeof targetUser === "string") {
          throw new ErrorMessage(targetUser);
        }
        abilityValue.total = targetUser;
      }

      await db.user.update({
        where: {
          id: targetUserId,
        },
        data: {
          [fieldToUpdate]: {
            increment: abilityValue.total,
          },
        },
      });
    }),
  );

  await finalizeAbilityUsage(db, castingUser, ability);
  logger.info(
    `User ${castingUser.username} used ability ${ability.name} on user ${targetUserIds} and gained ${ability.xpGiven} XP`,
  );

  return {
    message: "Target given " + abilityValue.total + " " + fieldToUpdate,
    diceRoll:
      "output" in abilityValue
        ? abilityValue.output.split("[")[1].split("]")[0]
        : "",
  };
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
    throw new ErrorMessage("Target is dead");
  }

  if (castingUser.hp <= targetUser.hp) {
    throw new ErrorMessage(
      "You cannot swap health with a target that has more health than you",
    );
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

  await addLog(
    db,
    targetUserId,
    `${castingUser.username} swapped health with you`,
    false,
  );

  await activatePassive(db, castingUser, [castingUser.id], ability);
  logger.info(
    `User ${castingUser.username} used ability ${ability.name} on user ${targetUserId} and gained ${ability.xpGiven} XP`,
  );

  return { message: "You swapped health with the target", diceRoll: "" };
};

const useTradeAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  targetUserId: string,
  ability: Ability,
) => {
  // TODO: At the moment the trade ability is only used to trade health to mana
  const manaValue = await manaValidator(db, targetUserId, ability.value!);

  if (manaValue === 0) {
    throw new ErrorMessage("Target is already at full mana");
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

  await finalizeAbilityUsage(db, castingUser, ability);
  logger.info(
    `User ${castingUser.username} used ability ${ability.name} and gained ${ability.xpGiven} XP`,
  );

  return {
    message:
      "You traded " +
      ability.healthCost +
      " , and the target recieved " +
      manaValue +
      " mana",
    diceRoll: "",
  };
};

const useDecreaseHealthAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  targetUserId: string,
  ability: Ability,
) => {
  // TODO: At the moment the ability only decreases maxhealth to mana
  const manaValue = await manaValidator(db, targetUserId, ability.value!);

  if (manaValue === 0) {
    throw new ErrorMessage("Target is already at full mana");
  }

  if (!ability.healthCost) {
    throw new ErrorMessage(
      "Error during health health cost calculation. Please notify a game master.",
    );
  }

  if (castingUser.hpMax - ability.healthCost < 10) {
    throw new ErrorMessage(
      "Your max health is too low to use this ability. You need at least 10 max health to use this ability",
    );
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

  await activatePassive(db, castingUser, [castingUser.id], ability);
  logger.info(
    `User ${castingUser.username} used ability ${ability.name} and gained ${ability.xpGiven} XP`,
  );

  return {
    message:
      "Your max health was decreased by " +
      ability.healthCost +
      " , and the target recieved " +
      manaValue +
      " mana",
    diceRoll: "",
  };
};

const useProtectionAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  targetUserIds: string[],
  ability: Ability,
) => {
  const abilityValue = getAbilityValue(ability);

  await Promise.all(
    targetUserIds.map(async (targetUserId) => {
      // check if user already has passive
      const targetHasPassive = await db.userPassive.findFirst({
        where: {
          userId: targetUserId,
          abilityName: ability.name,
        },
      });

      if (targetHasPassive && targetUserIds.length === 1) {
        throw new ErrorMessage("Target already has this passive");
      }

      await db.userPassive.create({
        data: {
          userId: targetUserId,
          effectType: ability.type,
          passiveName: ability.name,
          abilityName: ability.name,
          icon: ability.icon,
          value: abilityValue.total,
          endTime: ability.duration
            ? new Date(Date.now() + ability.duration * 60000).toISOString()
            : undefined, // 1 * 60000 = 1 minute
        },
      });
      await addLog(
        db,
        targetUserId,
        `${castingUser.username} is shielding you`,
        false,
      );
    }),
  );

  await finalizeAbilityUsage(db, castingUser, ability);
  logger.info(
    `User ${castingUser.username} used ability ${ability.name} on user ${targetUserIds} and gained ${ability.xpGiven} XP`,
  );

  return {
    message: "Target recieved " + abilityValue.total + " shield",
    diceRoll:
      "output" in abilityValue
        ? abilityValue.output.split("[")[1].split("]")[0]
        : "",
  };
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
  return { message: "You gained " + ability.xpGiven + " XP", diceRoll: "" };
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

  await finalizeAbilityUsage(db, castingUser, ability);
  logger.info(
    `User ${castingUser.username} used ability ${ability.name} on user ${targetUserIds} and gained ${ability.xpGiven} XP`,
  );

  return {
    message: "Guild recieved " + ability.value + " arena tokens",
    diceRoll: "",
  };
};

const useTurnsAbility = async (
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
          turns: {
            increment: ability.value!,
          },
        },
      });
    }),
  );

  await finalizeAbilityUsage(db, castingUser, ability);
  logger.info(
    `User ${castingUser.username} used ability ${ability.name} on user ${targetUserIds} and gained ${ability.xpGiven} XP`,
  );

  return {
    message: "The Guild gets another " + ability.value + " Turn",
    diceRoll: "",
  };
};

const useGoldAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  targetUserIds: string[],
  ability: Ability,
) => {
  const abilityValue = getAbilityValue(ability);

  await Promise.all(
    targetUserIds.map(async (targetUserId) => {
      await db.user.update({
        where: {
          id: targetUserId,
        },
        data: {
          gold: {
            increment: abilityValue.total,
          },
        },
      });
    }),
  );

  await finalizeAbilityUsage(db, castingUser, ability);
  logger.info(
    `User ${castingUser.username} used ability ${ability.name} on user ${targetUserIds} and gained ${ability.xpGiven} XP`,
  );

  return {
    message: "You recieved " + abilityValue.total + " gold!",
    diceRoll:
      "output" in abilityValue
        ? abilityValue.output.split("[")[1].split("]")[0]
        : "",
  };
};

// ---------------------------- Helper functions for specific ability types ----------------------------

const useEvadeAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  ability: Ability,
) => {
  // checks if user has passive, decrements cost and gives xp
  await activatePassive(db, castingUser, [castingUser.id], ability);

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
    `User ${castingUser.username} evaded daily cosmic event and gained ${ability.xpGiven} XP`,
  );

  return { message: "Cosmic event evaded!", diceRoll: "" };
};

const useTwistOfFateAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  ability: Ability,
) => {
  const dice = getAbilityValue(ability);

  let message = "";
  if (dice.total === 20) {
    message =
      "You rolled a 20! Inform a game master to (potentially) reroll the cosmic event!";
  } else {
    message = "You rolled a " + dice.total + ". Better luck next time!";
  }

  await addLog(
    db,
    castingUser.id,
    `${castingUser.username} used Twist of Fate, and rolled a ${dice.total}`,
  );
  await activatePassive(db, castingUser, [castingUser.id], ability);
  return {
    message,
    diceRoll: "output" in dice ? dice.output.split("[")[1].split("]")[0] : "",
  };
};
