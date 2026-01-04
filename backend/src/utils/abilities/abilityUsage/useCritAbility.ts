import { Ability, User } from "lib/db.js";
import { PrismaTransaction } from "types/prismaTransaction.js";
import { ApiResponse } from "../../../types/apiResponse.js";
import { addLog } from "../../logs/addLog.js";
import { activatePassive } from "./activatePassive.js";
import { finalizeAbilityUsage } from "./finalizeAbilityUsage.js";
import { getAbilityValue } from "./getAbilityValue.js";

export const useCritAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  targetUserIds: string[],
  ability: Ability,
): Promise<ApiResponse<{ message: string; diceRoll: string }>> => {
  const dice = getAbilityValue(ability);

  let message = "";
  if (dice.total === 20) {
    message =
      "You rolled a 20! All attacks in the dungeon will roll for double damage for the next hour!";
    await activatePassive(db, castingUser, targetUserIds, ability);
  } else {
    message = "You rolled a " + dice.total + ". Better luck next time!";
    await finalizeAbilityUsage(db, castingUser, ability);
  }

  await addLog(
    db,
    castingUser.id,
    `${castingUser.username} used ${ability.name}, and rolled a ${dice.total}`,
  );
  return {
    success: true,
    data: {
      message,
      diceRoll: "output" in dice ? dice.output.split("[")[1].split("]")[0] : "",
    },
  };
};
