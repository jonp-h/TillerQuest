import { db } from "lib/db.js";
import { ErrorMessage } from "lib/error.js";
import { logger } from "lib/logger.js";
import { ApiResponse } from "types/apiResponse.js";
import { getUserPassiveEffect } from "../getUserPassiveEffect.js";
import { activatePassive } from "./activatePassive.js";
import { useAccessAbility } from "./useAccessAbility.js";
import { useArenaAbility } from "./useArenaAbility.js";
import { useCritAbility } from "./useCritAbility.js";
import { useDecreaseHealthAbility } from "./useDecreaseHealthAbility.js";
import { useDungeonAttackAbility } from "./useDungeonAttackAbility.js";
import { useEvadeAbility } from "./useEvadeAbility.js";
import { useGoldAbility } from "./useGoldAbility.js";
import { useHealAbility } from "./useHealAbility.js";
import { useManaAbility } from "./useManaAbility.js";
import { useReviveAbility } from "./useReviveAbility.js";
import { useSwapAbility } from "./useSwapAbility.js";
import { useTradeAbility } from "./useTradeAbility.js";
import { useTransferAbility } from "./useTransferAbility.js";
import { useTurnsAbility } from "./useTurnsAbility.js";
import { useTwistOfFateAbility } from "./useTwistOfFateAbility.js";
import { useXPAbility } from "./useXPAbility.js";

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
): Promise<ApiResponse<{ message: string; diceRoll: string }>> => {
  try {
    const castingUser = await db.user.findUnique({
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

    const ability = await db.ability.findFirst({
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

    // if the school class includes IM, the school class is vg1, else vg2
    let query: string;
    if (castingUser.schoolClass?.toString().includes("IM")) {
      query = "selectedForVg1";
    } else {
      query = "selectedForVg2";
    }

    const cosmic = await db.cosmicEvent.findFirst({
      where: {
        [query]: true,
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
    //FIXME: cost increase should not trigger on cosmic abilities that increase xpgain
    // Skip cost increase if the increaseCostType is "Experience"
    const increasedCostType =
      cosmic?.increaseCostType === "All" ? "All" : ability.type;
    const shouldIncreaseCost = cosmic?.increaseCostType !== "Experience";
    const increasedCost = shouldIncreaseCost
      ? (await getUserPassiveEffect(
          db,
          castingUser.id,
          increasedCostType,
          true,
        )) / 100
      : 0;

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

    return await db.$transaction(async (tx) => {
      // check ability type and call the appropriate function
      switch (ability.type) {
        // ---------------------------- Passive abilities ----------------------------
        // TODO: make passives default in switch case
        case "IncreaseHealth":
          return await activatePassive(tx, castingUser, targetIds, ability);

        case "IncreaseMana":
          return await activatePassive(tx, castingUser, targetIds, ability);

        case "DecreaseHealth":
          return await useDecreaseHealthAbility(
            tx,
            castingUser,
            targetIds[0],
            ability,
          );

        case "DailyMana": // gives daily mana to the target
          return await activatePassive(tx, castingUser, targetIds, ability);

        case "ManaPassive": // gives extra mana to the target on every mana granting ability
          return await activatePassive(tx, castingUser, targetIds, ability);

        case "Health":
          return await activatePassive(tx, castingUser, targetIds, ability);

        case "Experience":
          return await activatePassive(tx, castingUser, targetIds, ability);

        case "ArenaToken":
          return await activatePassive(tx, castingUser, targetIds, ability);

        case "Trickery":
          if (ability.name === "Evade") {
            return await useEvadeAbility(tx, castingUser, ability);
          } else if (ability.name === "Twist-of-Fate") {
            return await useTwistOfFateAbility(tx, castingUser, ability);
          }
          return await activatePassive(tx, castingUser, targetIds, ability);

        case "Postpone":
          return await activatePassive(tx, castingUser, targetIds, ability);

        case "ManaShield":
          return await activatePassive(tx, castingUser, targetIds, ability);

        case "GoldPassive":
          return await activatePassive(tx, castingUser, targetIds, ability);

        case "TurnPassive":
          // TODO: considering moving this. Required to give immediate turns to the user
          await tx.user.update({
            where: {
              id: castingUser.id,
            },
            data: {
              turns: {
                increment: 1,
              },
            },
          });
          return await activatePassive(tx, castingUser, targetIds, ability);

        case "Access":
          return await useAccessAbility(tx, castingUser, targetIds, ability);

        case "Crit":
          return await useCritAbility(tx, castingUser, targetIds, ability);

        case "VictoryGold":
          return await activatePassive(tx, castingUser, targetIds, ability);

        case "VictoryMana":
          return await activatePassive(tx, castingUser, targetIds, ability);

        case "Protection": // shields a target from damage
          return await activatePassive(tx, castingUser, targetIds, ability);

        // ---------------------------- Active abilities ----------------------------

        case "Heal": // heal the target
          return await useHealAbility(tx, castingUser, targetIds, ability);

        case "Revive": // revive a dead target without negative consequences
          return await useReviveAbility(tx, castingUser, targetIds, ability);

        case "Mana": // give mana to the target
          return await useManaAbility(tx, castingUser, targetIds, ability);

        case "Gold":
          return await useGoldAbility(tx, castingUser, targetIds, ability);

        case "Transfer": // transfer a resource from one player to another player
          return await useTransferAbility(tx, castingUser, targetIds, ability);

        case "Swap": // swap a resource between two players
          return await useSwapAbility(tx, castingUser, targetIds[0], ability);

        // TODO: validate to only target self?
        case "Trade": // converts a resource from one type to another
          return await useTradeAbility(tx, castingUser, targetIds[0], ability);

        case "Arena":
          return await useArenaAbility(tx, castingUser, targetIds, ability);

        case "Turns":
          return await useTurnsAbility(tx, castingUser, targetIds, ability);

        case "XP":
          return await useXPAbility(tx, castingUser, ability);

        case "DungeonAttack":
          return await useDungeonAttackAbility(
            tx,
            castingUser,
            targetIds,
            ability,
          );

        default:
          throw new ErrorMessage("Unknown ability");
      }
    });
  } catch (error) {
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
