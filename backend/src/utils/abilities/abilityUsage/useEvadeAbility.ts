import { Ability, User } from "@tillerquest/prisma/browser";
import { logger } from "../../../lib/logger.js";
import { PrismaTransaction } from "types/prismaTransaction.js";
import { ApiResponse } from "../../../types/apiResponse.js";
import { activatePassive } from "./activatePassive.js";

export const useEvadeAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  ability: Ability,
): Promise<ApiResponse<{ message: string; diceRoll: string }>> => {
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
