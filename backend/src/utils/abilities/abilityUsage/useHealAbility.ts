import { Ability, User } from "lib/db.js";
import { logger } from "../../../lib/logger.js";
import { PrismaTransaction } from "types/prismaTransaction.js";
import { ServerActionResult } from "../../../types/serverActionResult.js";
import { ErrorMessage } from "../../../lib/error.js";
import { healingValidator } from "../abilityValidators.js";
import { addLog } from "../../logs/addLog.js";
import { finalizeAbilityUsage } from "./finalizeAbilityUsage.js";
import { getAbilityValue } from "./getAbilityValue.js";

export const useHealAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  targetUsersIds: string[],
  ability: Ability,
): Promise<ServerActionResult<{ message: string; diceRoll: string }>> => {
  const abilityValue = getAbilityValue(ability);
  let deadUsers = false;

  await Promise.all(
    targetUsersIds.map(async (targetUserId) => {
      // validate health to heal and passives
      const valueToHeal = await healingValidator(
        db,
        targetUserId,
        abilityValue.total,
      );

      if (valueToHeal === 0 && targetUsersIds.length === 1) {
        throw new ErrorMessage("Target is already at full health");
      } else if (
        valueToHeal === "User is dead" &&
        targetUsersIds.length === 1
      ) {
        throw new ErrorMessage(
          "You can't heal a dead target. The dead require a different kind of magic.",
        );
        // if the value is a number, heal the target
      } else if (typeof valueToHeal !== "string") {
        const targetUser = await db.user.update({
          where: {
            id: targetUserId,
          },
          data: {
            hp: {
              increment: valueToHeal,
            },
          },
          select: {
            username: true,
          },
        });
        await addLog(
          db,
          targetUserId,
          `${targetUser.username} was healed for ${valueToHeal} by ${castingUser.username}`,
        );
        // the only remaining option is that the user is dead. Else if for clarity
      } else if (valueToHeal === "User is dead") {
        deadUsers = true;
      }
    }),
  );
  await finalizeAbilityUsage(db, castingUser, ability);
  logger.info(
    `User ${castingUser.username} used ability ${ability.name} on users ${targetUsersIds} and gained ${ability.xpGiven} XP`,
  );

  return {
    success: true,
    data: {
      message:
        "Healed " +
        abilityValue.total +
        " successfully" +
        (deadUsers ? " (Some targets are dead and were not healed)" : ""),
      diceRoll:
        "output" in abilityValue
          ? abilityValue.output.split("[")[1].split("]")[0]
          : "",
    },
  };
};
