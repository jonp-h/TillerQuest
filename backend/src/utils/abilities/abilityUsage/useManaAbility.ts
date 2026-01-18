import { Ability, User } from "lib/db.js";
import { logger } from "../../../lib/logger.js";
import { PrismaTransaction } from "types/prismaTransaction.js";
import { ApiResponse } from "../../../types/apiResponse.js";
import { ErrorMessage } from "../../../lib/error.js";
import { manaValidator } from "../abilityValidators.js";
import { addLog } from "../../logs/addLog.js";
import { finalizeAbilityUsage } from "./finalizeAbilityUsage.js";
import { getAbilityValue } from "./getAbilityValue.js";

export const useManaAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  targetUserIds: string[],
  ability: Ability,
): Promise<ApiResponse<{ message: string; diceRoll: string }>> => {
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
        `${targetUser.username} received ${value} mana from ${castingUser.username}`,
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
