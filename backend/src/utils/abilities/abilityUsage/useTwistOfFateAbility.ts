import { Ability, User } from "lib/db.js";
import { PrismaTransaction } from "types/prismaTransaction.js";
import { ApiResponse } from "../../../types/apiResponse.js";
import { addLog } from "../../logs/addLog.js";
import { activatePassive } from "./activatePassive.js";
import { getAbilityValue } from "./getAbilityValue.js";

export const useTwistOfFateAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  ability: Ability,
): Promise<ApiResponse<{ message: string; diceRoll: string }>> => {
  const dice = getAbilityValue(ability);

  let message = "";
  if (dice.total === 20) {
    message =
      "You rolled a 20! Inform a game master to (potentially) reroll the cosmic event!";
  } else {
    message = "You rolled a " + dice.total + ". Better luck next time!";
  }

  await addLog(
    db,
    castingUser.id,
    `${castingUser.username} used Twist of Fate, and rolled a ${dice.total}`,
  );
  await activatePassive(db, castingUser, [castingUser.id], ability);
  return {
    success: true,
    data: {
      message,
      diceRoll: "output" in dice ? dice.output.split("[")[1].split("]")[0] : "",
    },
  };
};
