"use server";

import { $Enums, Ability, GuildEnemy, User } from "@prisma/client";
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
import {
  AuthorizationError,
  validateUserIdAndActiveUserAuth,
} from "@/lib/authUtils";
import { addAnalytics } from "@/data/analytics/analytics";
import { ServerActionResult } from "@/types/serverActionResult";

/**
 * Selects and uses an ability for a user on a target user.
 *
 * @param user - The user who is using the ability.
 * @param targetIds - The ID of the targets on whom the ability is being used.
 * @param abilityName - The name of the ability being used.
 * @returns A promise that resolves to a string message indicating the result of the ability usage.
 *
 * @remarks
 * - If the user's HP is 0, they cannot use abilities and a message is returned.
 * - If the user does not have enough mana to use the ability, a message is returned.
 * - Depending on the type of ability, the appropriate function is called to handle the ability usage.
 */
export const selectAbility = async (
  userId: string,
  targetIds: string[],
  abilityName: string,
): Promise<ServerActionResult<{ message: string; diceRoll: string }>> => {
  try {
    await validateUserIdAndActiveUserAuth(userId);

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

    switch (ability.target) {
      case "SingleTarget":
        if (targetIds.length !== 1) {
          throw new ErrorMessage(
            "Single target abilities require exactly one target",
          );
        }
        if (targetIds.includes(userId)) {
          throw new ErrorMessage(
            "You cannot target yourself with this ability",
          );
        }
        break;

      default:
        break;
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
          return await activatePassive(db, castingUser, targetIds, ability);

        case "IncreaseMana":
          return await activatePassive(db, castingUser, targetIds, ability);

        case "DecreaseHealth":
          return await useDecreaseHealthAbility(
            db,
            castingUser,
            targetIds[0],
            ability,
          );

        case "DailyMana": // gives daily mana to the target
          return await activatePassive(db, castingUser, targetIds, ability);

        case "ManaPassive": // gives extra mana to the target on every mana granting ability
          return await activatePassive(db, castingUser, targetIds, ability);

        case "Health":
          return await activatePassive(db, castingUser, targetIds, ability);

        case "Experience":
          return await activatePassive(db, castingUser, targetIds, ability);

        case "ArenaToken":
          return await activatePassive(db, castingUser, targetIds, ability);

        case "Trickery":
          if (ability.name === "Evade") {
            return await useEvadeAbility(db, castingUser, ability);
          } else if (ability.name === "Twist-of-Fate") {
            return await useTwistOfFateAbility(db, castingUser, ability);
          }
          return await activatePassive(db, castingUser, targetIds, ability);

        case "Postpone":
          return await activatePassive(db, castingUser, targetIds, ability);

        case "Experience":
          return await activatePassive(db, castingUser, targetIds, ability);
        case "ManaShield":
          return await activatePassive(db, castingUser, targetIds, ability);
        case "GoldPassive":
          return await activatePassive(db, castingUser, targetIds, ability);
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
          return await activatePassive(db, castingUser, targetIds, ability);
        case "Access":
          return await useAccessAbility(db, castingUser, targetIds, ability);
        case "Crit":
          return await useCritAbility(db, castingUser, targetIds, ability);
        case "VictoryGold":
          return await activatePassive(db, castingUser, targetIds, ability);
        case "VictoryMana":
          return await activatePassive(db, castingUser, targetIds, ability);

        // ---------------------------- Active abilities ----------------------------

        case "Heal": // heal the target
          return await useHealAbility(db, castingUser, targetIds, ability);

        case "Revive": // revive a dead target without negative consequences
          return await useReviveAbility(db, castingUser, targetIds, ability);

        case "Mana": // give mana to the target
          return await useManaAbility(db, castingUser, targetIds, ability);

        case "Gold":
          return await useGoldAbility(db, castingUser, targetIds, ability);

        case "Transfer": // transfer a resource from one player to another player
          return await useTransferAbility(db, castingUser, targetIds, ability);

        case "Swap": // swap a resource between two players
          return await useSwapAbility(db, castingUser, targetIds[0], ability);

        // TODO: validate to only target self?
        case "Trade": // converts a resource from one type to another
          return await useTradeAbility(db, castingUser, targetIds[0], ability);

        case "Protection": // shields a target from damage
          return await useProtectionAbility(
            db,
            castingUser,
            targetIds,
            ability,
          );

        case "Arena":
          return await useArenaAbility(db, castingUser, targetIds, ability);
        case "Turns":
          return await useTurnsAbility(db, castingUser, targetIds, ability);

        case "XP":
          return await useXPAbility(db, castingUser, ability);

        case "DungeonAttack":
          return await useDungeonAttackAbility(
            db,
            castingUser,
            targetIds,
            ability,
          );

        default:
          throw new ErrorMessage("Unknown ability");
      }
    });
  } catch (error) {
    // if the error is an instance of AuthError, it means the user does not have the required permissions
    if (error instanceof AuthorizationError) {
      logger.warn(`Auth violation: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }

    // if the error is an instance of ErrorMessage, the message can be returned directly
    if (error instanceof ErrorMessage) {
      return {
        success: false,
        error: error.message,
      };
    }
    logger.error(
      "Error using " +
        abilityName +
        " by user " +
        userId +
        " on targets " +
        targetIds +
        ": " +
        error,
    );
    return {
      success: false,
      error:
        "Something went wrong using " +
        abilityName +
        ". Please notify a game master of this timestamp: " +
        new Date().toLocaleString("no-NO"),
    };
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
): Promise<ServerActionResult<{ message: string; diceRoll: string }>> => {
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

        // TODO: improve codequality
        // if the ability increases health or mana, remove the previous effect
        if (ability.type === "IncreaseHealth") {
          await db.user.update({
            where: {
              id: targetUserId,
            },
            data: {
              hpMax: {
                decrement: ability.value ?? 0,
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
                decrement: ability.value ?? 0,
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
                increment: ability.healthCost ?? 0,
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
                increment: ability.manaCost ?? 0,
              },
            },
          });
        }
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
    success: true,
    data: {
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
    },
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
): Promise<ServerActionResult<{ message: string; diceRoll: string }>> => {
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
    success: true,
    data: {
      message: "Granted access to " + ability.name.replace(/-/g, " ") + "!",
      diceRoll: "",
    },
  };
};

// ---------------------------- Helper functions for specific ability types ----------------------------
const useHealAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  targetUsersIds: string[],
  ability: Ability,
): Promise<ServerActionResult<{ message: string; diceRoll: string }>> => {
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
    success: true,
    data: {
      message: "Healed " + abilityValue.total + " successfully",
      diceRoll:
        "output" in abilityValue
          ? abilityValue.output.split("[")[1].split("]")[0]
          : "",
    },
  };
};

const useReviveAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  targetUserIds: string[],
  ability: Ability,
): Promise<ServerActionResult<{ message: string; diceRoll: string }>> => {
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
    success: true,
    data: {
      message: "Successfully revived the target without negative consequences",
      diceRoll: "",
    },
  };
};

const useManaAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  targetUserIds: string[],
  ability: Ability,
): Promise<ServerActionResult<{ message: string; diceRoll: string }>> => {
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
    success: true,
    data: {
      message: "Gave " + abilityValue.total + " mana",
      diceRoll:
        "output" in abilityValue
          ? abilityValue.output.split("[")[1].split("]")[0]
          : "",
    },
  };
};

const useTransferAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  targetUserIds: string[],
  ability: Ability,
): Promise<ServerActionResult<{ message: string; diceRoll: string }>> => {
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
    success: true,
    data: {
      message: "Target given " + abilityValue.total + " " + fieldToUpdate,
      diceRoll:
        "output" in abilityValue
          ? abilityValue.output.split("[")[1].split("]")[0]
          : "",
    },
  };
};

const useSwapAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  targetUserId: string,
  ability: Ability,
): Promise<ServerActionResult<{ message: string; diceRoll: string }>> => {
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

  return {
    success: true,
    data: {
      message: "You swapped health with the target",
      diceRoll: "",
    },
  };
};

const useTradeAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  targetUserId: string,
  ability: Ability,
): Promise<ServerActionResult<{ message: string; diceRoll: string }>> => {
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
    success: true,
    data: {
      message:
        "You traded " +
        ability.healthCost +
        " , and the target recieved " +
        manaValue +
        " mana",
      diceRoll: "",
    },
  };
};

const useDecreaseHealthAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  targetUserId: string,
  ability: Ability,
): Promise<ServerActionResult<{ message: string; diceRoll: string }>> => {
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
    success: true,
    data: {
      message:
        "Your max health was decreased by " +
        ability.healthCost +
        " , and the target recieved " +
        manaValue +
        " mana",
      diceRoll: "",
    },
  };
};

const useProtectionAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  targetUserIds: string[],
  ability: Ability,
): Promise<ServerActionResult<{ message: string; diceRoll: string }>> => {
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
    success: true,
    data: {
      message: "Target recieved " + abilityValue.total + " shield",
      diceRoll:
        "output" in abilityValue
          ? abilityValue.output.split("[")[1].split("]")[0]
          : "",
    },
  };
};

const useXPAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  ability: Ability,
): Promise<ServerActionResult<{ message: string; diceRoll: string }>> => {
  logger.info(
    `User ${castingUser.id} used ability ${ability.name} on themselves and gained ${ability.xpGiven} XP`,
  );

  await finalizeAbilityUsage(db, castingUser, ability);
  return {
    success: true,
    data: {
      message: "You gained " + ability.xpGiven + " XP",
      diceRoll: "",
    },
  };
};

const useArenaAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  targetUserIds: string[],
  ability: Ability,
): Promise<ServerActionResult<{ message: string; diceRoll: string }>> => {
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
    success: true,
    data: {
      message: "Guild recieved " + ability.value + " arena tokens",
      diceRoll: "",
    },
  };
};

const useTurnsAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  targetUserIds: string[],
  ability: Ability,
): Promise<ServerActionResult<{ message: string; diceRoll: string }>> => {
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
    success: true,
    data: {
      message: "The Guild gets another " + ability.value + " Turn",
      diceRoll: "",
    },
  };
};

const useGoldAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  targetUserIds: string[],
  ability: Ability,
): Promise<ServerActionResult<{ message: string; diceRoll: string }>> => {
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
    success: true,
    data: {
      message: "You recieved " + abilityValue.total + " gold!",
      diceRoll:
        "output" in abilityValue
          ? abilityValue.output.split("[")[1].split("]")[0]
          : "",
    },
  };
};

// ---------------------------- Helper functions for specific ability types ----------------------------

const useEvadeAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  ability: Ability,
): Promise<ServerActionResult<{ message: string; diceRoll: string }>> => {
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

  return {
    success: true,
    data: { message: "Cosmic event evaded!", diceRoll: "" },
  };
};

const useTwistOfFateAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  ability: Ability,
): Promise<ServerActionResult<{ message: string; diceRoll: string }>> => {
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
    success: true,
    data: {
      message,
      diceRoll: "output" in dice ? dice.output.split("[")[1].split("]")[0] : "",
    },
  };
};

const useCritAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  targetUserIds: string[],
  ability: Ability,
): Promise<ServerActionResult<{ message: string; diceRoll: string }>> => {
  const dice = getAbilityValue(ability);

  let message = "";
  if (dice.total === 20) {
    message =
      "You rolled a 20! All attacks in the dungeon will roll for double damage for the next hour!";
    await activatePassive(db, castingUser, targetUserIds, ability);
  } else {
    message = "You rolled a " + dice.total + ". Better luck next time!";
    await finalizeAbilityUsage(db, castingUser, ability);
  }

  await addLog(
    db,
    castingUser.id,
    `${castingUser.username} used Critical Role, and rolled a ${dice.total}`,
  );
  return {
    success: true,
    data: {
      message,
      diceRoll: "output" in dice ? dice.output.split("[")[1].split("]")[0] : "",
    },
  };
};

// ----------------------------- DUNGEON ABILITIES -----------------------------

const useDungeonAttackAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  targetIds: string[],
  ability: Ability,
): Promise<ServerActionResult<{ message: string; diceRoll: string }>> => {
  if (castingUser?.turns <= 0) {
    throw new ErrorMessage("You don't have any turns left!");
  }

  const enemies = await db.guildEnemy.findMany({
    where: {
      id: { in: targetIds },
      guildName: castingUser.guildName || "",
    },
  });

  if (
    !enemies ||
    (enemies.length == 1 &&
      ability.target == "SingleTarget" &&
      enemies[0].health <= 0)
  ) {
    throw new ErrorMessage("The enemy is already dead!");
  }

  await db.user.update({
    where: { id: castingUser.id },
    data: { turns: { decrement: 1 } },
  });

  let message = "";

  // ---------- Special case for Slice-And-Dice, which deals half of the enemy's current health as damage --------
  if (ability.name === "Slice-And-Dice") {
    const cooldown = await db.userPassive.findFirst({
      where: {
        userId: castingUser.id,
        abilityName: "Slice-And-Dice",
      },
    });

    if (cooldown) {
      throw new ErrorMessage(
        "Slice-And-Dice is on cooldown. Please wait before using it again.",
      );
    }

    const damage = Math.floor(enemies[0].health / 2);
    await damageEnemies(db, [enemies[0]], damage);

    await addLog(
      db,
      castingUser.id,
      `DUNGEON: ${castingUser.username} used Slice-And-Dice, dealing ${damage} damage.`,
    );

    await addAnalytics(db, castingUser.id, "dungeon_attack", {
      abilityId: ability.id,
      hpChange: damage,
      userClass: castingUser.class || "",
      targetCount: targetIds.length,
    });

    await finalizeAbilityUsage(db, castingUser, ability);

    return {
      success: true,
      data: {
        message: `You used Slice-And-Dice, dealing ${damage} damage!`,
        diceRoll: "",
      },
    };
  }
  // --------- normal case for other abilities --------
  const value = getAbilityValue(ability);

  const critPassive = await getUserPassiveEffect(db, castingUser.id, "Crit");

  let damageResult = value.total;
  if (critPassive > 0) {
    damageResult = value.total * 2;
  }

  await damageEnemies(db, enemies, damageResult);

  message =
    critPassive > 0
      ? "Rolled " +
        value.total +
        "! But with crit it turned into " +
        damageResult
      : "Rolled " + value.total + "!";

  await addAnalytics(db, castingUser.id, "dungeon_attack", {
    abilityId: ability.id,
    hpChange: damageResult,
    userClass: castingUser.class || "",
    targetCount: targetIds.length,
  });

  await addLog(
    db,
    castingUser.id,
    `DUNGEON: ${castingUser.username} finished their turn and rolled ${damageResult} damage.`,
  );

  await finalizeAbilityUsage(db, castingUser, ability);

  return {
    success: true,
    data: {
      message,
      diceRoll:
        "output" in value ? value.output.split("[")[1].split("]")[0] : "",
    },
  };
};

async function damageEnemies(
  db: PrismaTransaction,
  targetEnemies: GuildEnemy[],
  diceResult: number,
) {
  for (const targetEnemy of targetEnemies) {
    if (targetEnemy.health <= 0) {
      // Enemy is already dead, skip damage and reward
      continue;
    }

    const enemyAfter = await db.guildEnemy.update({
      where: { id: targetEnemy.id },
      data: { health: { decrement: diceResult } },
      select: { health: true, guildName: true },
    });

    // Only reward users if the enemy was alive before and is now dead
    if (targetEnemy.health > 0 && enemyAfter.health <= 0) {
      await rewardUsers(db, targetEnemy.id, enemyAfter.guildName);
    }
  }
}

async function rewardUsers(
  db: PrismaTransaction,
  enemyId: string,
  guild: string,
) {
  const users = await db.user.findMany({
    where: {
      guildName: guild,
    },
  });
  const rewards = await db.guildEnemy.findFirst({
    where: { id: enemyId },
    select: {
      name: true,
      xp: true,
      gold: true,
      guildName: true,
    },
  });

  if (!rewards) {
    logger.error("No rewards found for enemy: " + enemyId);
    return;
  }

  for (const user of users) {
    await experienceAndLevelValidator(db, user, rewards.xp);
    const goldMultipler = await getUserPassiveEffect(
      db,
      user.id,
      "VictoryGold",
    );

    const goldToGive = Math.floor(rewards.gold * (1 + goldMultipler / 100));

    const bonusMana = await getUserPassiveEffect(db, user.id, "VictoryMana");
    const manaToGive = await manaValidator(db, user.id, bonusMana);

    await db.user.update({
      where: { id: user.id },
      data: {
        gold: { increment: goldToGive },
        mana: { increment: manaToGive },
      },
    });

    await addLog(
      db,
      user.id,
      bonusMana
        ? `DUNGEON: ${rewards.name} has been slain. ${user.username} looted ${goldToGive} gold and gained ${manaToGive} mana.`
        : `DUNGEON: ${rewards.name} has been slain. ${user.username} looted ${goldToGive} gold.`,
    );
  }

  await db.analytics.create({
    data: {
      triggerType: "dungeon_reward",
      xpChange: rewards.xp,
      goldChange: rewards.gold,
      guildName: rewards.guildName,
    },
  });
}
