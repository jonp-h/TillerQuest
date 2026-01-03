import { Ability, User } from "lib/db.js";
import { logger } from "../../../lib/logger.js";
import { PrismaTransaction } from "types/prismaTransaction.js";
import { ServerActionResult } from "../../../types/serverActionResult.js";
import { ErrorMessage } from "../../../lib/error.js";
import { manaValidator } from "../abilityValidators.js";
import { activatePassive } from "./activatePassive.js";

export const useDecreaseHealthAbility = async (
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
      "Error during health cost calculation. Please notify a game master.",
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
        " , and the target received " +
        manaValue +
        " mana",
      diceRoll: "",
    },
  };
};
