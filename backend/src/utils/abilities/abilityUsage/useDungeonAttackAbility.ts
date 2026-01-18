import { Ability, User } from "lib/db.js";
import { PrismaTransaction } from "types/prismaTransaction.js";
import { ApiResponse } from "../../../types/apiResponse.js";
import { ErrorMessage } from "../../../lib/error.js";
import { getUserPassiveEffect } from "../getUserPassiveEffect.js";
import { addLog } from "../../logs/addLog.js";
import { addAnalytics } from "../../analytics/addAnalytics.js";
import { finalizeAbilityUsage } from "./finalizeAbilityUsage.js";
import { getAbilityValue } from "./getAbilityValue.js";
import { activatePassive } from "./activatePassive.js";
import { damageEnemies } from "./damageEnemies.js";

export const useDungeonAttackAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  targetIds: string[],
  ability: Ability,
): Promise<ApiResponse<{ message: string; diceRoll: string }>> => {
  if (castingUser?.turns <= 0) {
    throw new ErrorMessage("You don't have any turns left!");
  }

  const enemies = await db.guildEnemy.findMany({
    where: {
      id: { in: targetIds },
      guildName: castingUser.guildName || "",
    },
  });

  if (
    !enemies ||
    (enemies.length == 1 &&
      ability.target == "SingleTarget" &&
      enemies[0].health <= 0)
  ) {
    throw new ErrorMessage("The enemy is already dead!");
  }

  await db.user.update({
    where: { id: castingUser.id },
    data: { turns: { decrement: 1 } },
  });

  let message = "";

  // ---------- Special case for Slice-And-Dice, which deals half of the enemy's current health as damage --------
  if (ability.name === "Slice-And-Dice") {
    const cooldown = await db.userPassive.findFirst({
      where: {
        userId: castingUser.id,
        abilityName: "Slice-And-Dice",
      },
    });

    if (cooldown) {
      throw new ErrorMessage(
        "Slice-And-Dice is on cooldown. Please wait before using it again.",
      );
    }

    const damage = Math.floor(enemies[0].health / 2);
    await damageEnemies(db, [enemies[0]], damage);

    await addLog(
      db,
      castingUser.id,
      `DUNGEON: ${castingUser.username} used Slice and Dice, dealing ${damage} damage.`,
    );

    await addAnalytics(db, castingUser.id, castingUser.role, "dungeon_attack", {
      abilityId: ability.id,
      hpChange: damage,
      userClass: castingUser.class || "",
      targetCount: targetIds.length,
    });

    // create passive cooldown
    await activatePassive(db, castingUser, [castingUser.id], ability);

    return {
      success: true,
      data: {
        message: `You used Slice and Dice, dealing ${damage} damage!`,
        diceRoll: "",
      },
    };
  }
  // --------- normal case for other abilities --------
  const value = getAbilityValue(ability);

  const critPassive = await getUserPassiveEffect(db, castingUser.id, "Crit");

  let damageResult = value.total;
  if (critPassive > 0) {
    damageResult = value.total * 2;
  }

  await damageEnemies(db, enemies, damageResult);

  message =
    critPassive > 0
      ? "Rolled " +
        value.total +
        "! But with crit it turned into " +
        damageResult
      : "Rolled " + value.total + "!";

  await addAnalytics(db, castingUser.id, castingUser.role, "dungeon_attack", {
    abilityId: ability.id,
    hpChange: damageResult,
    userClass: castingUser.class || "",
    targetCount: targetIds.length,
  });

  await addLog(
    db,
    castingUser.id,
    `DUNGEON: ${castingUser.username} finished their turn and rolled ${damageResult} damage.`,
  );

  await finalizeAbilityUsage(db, castingUser, ability);

  return {
    success: true,
    data: {
      message,
      diceRoll:
        "output" in value ? value.output.split("[")[1].split("]")[0] : "",
    },
  };
};
