import { Ability, User } from "lib/db.js";
import { logger } from "../../../lib/logger.js";
import { PrismaTransaction } from "types/prismaTransaction.js";
import { ServerActionResult } from "../../../types/serverActionResult.js";
import { ErrorMessage } from "../../../lib/error.js";
import { manaValidator } from "../abilityValidators.js";
import { finalizeAbilityUsage } from "./finalizeAbilityUsage.js";

export const useTradeAbility = async (
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
        " , and the target received " +
        manaValue +
        " mana",
      diceRoll: "",
    },
  };
};
