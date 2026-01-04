import { Ability, User } from "lib/db.js";
import { logger } from "../../../lib/logger.js";
import { PrismaTransaction } from "types/prismaTransaction.js";
import { ApiResponse } from "../../../types/apiResponse.js";
import { ErrorMessage } from "../../../lib/error.js";
import { addLog } from "../../logs/addLog.js";
import { activatePassive } from "./activatePassive.js";

export const useSwapAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  targetUserId: string,
  ability: Ability,
): Promise<ApiResponse<{ message: string; diceRoll: string }>> => {
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
