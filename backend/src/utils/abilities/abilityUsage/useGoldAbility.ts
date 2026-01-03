import { Ability, User } from "lib/db.js";
import { logger } from "../../../lib/logger.js";
import { PrismaTransaction } from "types/prismaTransaction.js";
import { ServerActionResult } from "../../../types/serverActionResult.js";
import { finalizeAbilityUsage } from "./finalizeAbilityUsage.js";
import { getAbilityValue } from "./getAbilityValue.js";

export const useGoldAbility = async (
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
      message: "You received " + abilityValue.total + " gold!",
      diceRoll:
        "output" in abilityValue
          ? abilityValue.output.split("[")[1].split("]")[0]
          : "",
    },
  };
};
