import { Ability, User } from "lib/db.js";
import { PrismaTransaction } from "types/prismaTransaction.js";
import { ServerActionResult } from "../../../types/serverActionResult.js";
import { ErrorMessage } from "../../../lib/error.js";
import { getUsersMissingPassive } from "../abilityValidators.js";
import { addLog } from "../../logs/addLog.js";
import { finalizeAbilityUsage } from "./finalizeAbilityUsage.js";
import { getAbilityValue } from "./getAbilityValue.js";

export const activatePassive = async (
  db: PrismaTransaction,
  castingUser: User,
  targetUsersIds: string[],
  ability: Ability,
): Promise<ServerActionResult<{ message: string; diceRoll: string }>> => {
  const abilityValue = getAbilityValue(ability);

  const usersWithoutPassive = await getUsersMissingPassive(
    db,
    targetUsersIds,
    ability.name,
  );

  if (usersWithoutPassive.length === 0) {
    throw new ErrorMessage(
      `${targetUsersIds.length > 1 ? "All targets already have" : "Target already has"} this passive`,
    );
  }

  await Promise.all(
    usersWithoutPassive.map(async (targetUserId) => {
      // if the ability decreases health or mana, the value should be set to the cost
      if (ability.type === "DecreaseHealth") {
        abilityValue.total = ability.healthCost!;
      } else if (ability.type === "DecreaseMana") {
        abilityValue.total = ability.manaCost!;
      }

      // if the ability duration is not undefined, create a counter from the current time for 600000ms (10 minutes)
      await db.userPassive.create({
        data: {
          userId: targetUserId,
          effectType: ability.type,
          passiveName: ability.name,
          abilityName: ability.name,
          icon: ability.icon,
          value: abilityValue.total,
          endTime: ability.duration
            ? new Date(Date.now() + ability.duration * 60000).toISOString()
            : undefined, // 1 * 60000 = 1 minute
        },
      });

      if (ability.type === "IncreaseHealth") {
        await db.user.update({
          where: {
            id: targetUserId,
          },
          data: {
            hpMax: {
              increment: ability.value ?? 0,
            },
          },
        });
      } else if (ability.type === "IncreaseMana") {
        await db.user.update({
          where: {
            id: targetUserId,
          },
          data: {
            manaMax: {
              increment: ability.value ?? 0,
            },
          },
        });
      } else if (ability.type === "DecreaseHealth") {
        await db.user.update({
          where: {
            id: targetUserId,
          },
          data: {
            hpMax: {
              decrement: ability.healthCost ?? 0,
            },
          },
        });
      } else if (ability.type === "DecreaseMana") {
        await db.user.update({
          where: {
            id: targetUserId,
          },
          data: {
            manaMax: {
              decrement: ability.manaCost ?? 0,
            },
          },
        });
      }
      await addLog(
        db,
        targetUserId,
        `You were granted ${ability.name} from ${castingUser.username}` +
          (ability.duration ? ` for ${ability.duration} minutes.` : ""),
        false,
      );
    }),
  );
  await finalizeAbilityUsage(db, castingUser, ability);
  return {
    success: true,
    data: {
      message: ability.diceNotation
        ? "You rolled " +
          abilityValue.total +
          ". " +
          ability.name.replace(/-/g, " ") +
          " activated!"
        : "Activated " + ability.name.replace(/-/g, " ") + "!",
      diceRoll:
        "output" in abilityValue
          ? abilityValue.output.split("[")[1].split("]")[0]
          : "",
    },
  };
};
