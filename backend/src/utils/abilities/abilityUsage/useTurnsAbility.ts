import { Ability, User } from "lib/db.js";
import { logger } from "../../../lib/logger.js";
import { PrismaTransaction } from "types/prismaTransaction.js";
import { ApiResponse } from "../../../types/apiResponse.js";
import { finalizeAbilityUsage } from "./finalizeAbilityUsage.js";

export const useTurnsAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  targetUserIds: string[],
  ability: Ability,
): Promise<ApiResponse<{ message: string; diceRoll: string }>> => {
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
