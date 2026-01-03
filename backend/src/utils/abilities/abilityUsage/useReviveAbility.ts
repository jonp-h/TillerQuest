import { Ability, User } from "lib/db.js";
import { logger } from "../../../lib/logger.js";
import { PrismaTransaction } from "types/prismaTransaction.js";
import { ServerActionResult } from "../../../types/serverActionResult.js";
import { ErrorMessage } from "../../../lib/error.js";
import { addLog } from "../../logs/addLog.js";
import { finalizeAbilityUsage } from "./finalizeAbilityUsage.js";

export const useReviveAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  targetUserIds: string[],
  ability: Ability,
): Promise<ServerActionResult<{ message: string; diceRoll: string }>> => {
  const targetUser = await db.user.findUnique({
    where: {
      id: targetUserIds[0],
    },
  });

  if (!targetUser || targetUser.hp > 0) {
    throw new ErrorMessage("Target is not dead");
  }

  const target = await db.user.update({
    where: {
      id: targetUser.id,
    },
    data: {
      hp: 1,
    },
    select: {
      username: true,
    },
  });

  logger.info(
    `User ${castingUser.username} used ability ${ability.name} on user ${targetUserIds} and gained ${ability.xpGiven} XP`,
  );

  await addLog(
    db,
    targetUser.id,
    `REVIVAL: ${castingUser.username} revived ${target.username}`,
  );
  await finalizeAbilityUsage(db, castingUser, ability);
  return {
    success: true,
    data: {
      message: "Successfully revived the target without negative consequences",
      diceRoll: "",
    },
  };
};
