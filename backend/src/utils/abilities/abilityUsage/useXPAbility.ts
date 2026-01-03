import { Ability, User } from "lib/db.js";
import { logger } from "../../../lib/logger.js";
import { PrismaTransaction } from "types/prismaTransaction.js";
import { ServerActionResult } from "../../../types/serverActionResult.js";
import { finalizeAbilityUsage } from "./finalizeAbilityUsage.js";

export const useXPAbility = async (
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
