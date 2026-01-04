import { Ability, User } from "lib/db.js";
import { logger } from "../../../lib/logger.js";
import { PrismaTransaction } from "types/prismaTransaction.js";
import { ApiResponse } from "../../../types/apiResponse.js";
import { ErrorMessage } from "../../../lib/error.js";
import { healingValidator, manaValidator } from "../abilityValidators.js";
import { finalizeAbilityUsage } from "./finalizeAbilityUsage.js";
import { getAbilityValue } from "./getAbilityValue.js";

export const useTransferAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  targetUserIds: string[],
  ability: Ability,
): Promise<ApiResponse<{ message: string; diceRoll: string }>> => {
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
        // return error message if user cannot receive mana
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
