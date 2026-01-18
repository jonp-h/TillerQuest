import { GuildEnemy } from "lib/db.js";
import { logger } from "../../../lib/logger.js";
import { PrismaTransaction } from "types/prismaTransaction.js";
import { experienceAndLevelValidator } from "../abilityValidators.js";
import { getUserPassiveEffect } from "../getUserPassiveEffect.js";
import { manaValidator } from "../abilityValidators.js";
import { addLog } from "../../logs/addLog.js";

export async function damageEnemies(
  db: PrismaTransaction,
  targetEnemies: GuildEnemy[],
  diceResult: number,
) {
  for (const targetEnemy of targetEnemies) {
    if (targetEnemy.health <= 0) {
      // Enemy is already dead, skip damage and reward
      continue;
    }

    const enemyAfter = await db.guildEnemy.update({
      where: { id: targetEnemy.id },
      data: { health: { decrement: diceResult } },
      select: { health: true, guildName: true },
    });

    // Only reward users if the enemy was alive before and is now dead
    if (targetEnemy.health > 0 && enemyAfter.health <= 0) {
      await rewardUsers(db, targetEnemy.id, enemyAfter.guildName);
    }
  }
}

async function rewardUsers(
  db: PrismaTransaction,
  enemyId: string,
  guild: string,
) {
  const users = await db.user.findMany({
    where: {
      guildName: guild,
    },
  });
  const rewards = await db.guildEnemy.findFirst({
    where: { id: enemyId },
    select: {
      name: true,
      xp: true,
      gold: true,
      guildName: true,
    },
  });

  if (!rewards) {
    logger.error("No rewards found for enemy: " + enemyId);
    return;
  }

  for (const user of users) {
    await experienceAndLevelValidator(db, user.id, rewards.xp);
    const goldMultipler = await getUserPassiveEffect(
      db,
      user.id,
      "VictoryGold",
    );

    const goldToGive = Math.floor(rewards.gold * (1 + goldMultipler / 100));

    const bonusMana = await getUserPassiveEffect(db, user.id, "VictoryMana");
    const manaToGive = await manaValidator(db, user.id, bonusMana);

    await db.user.update({
      where: { id: user.id },
      data: {
        gold: { increment: goldToGive },
        mana: { increment: manaToGive },
      },
    });

    await addLog(
      db,
      user.id,
      bonusMana
        ? `DUNGEON: ${rewards.name} has been slain. ${user.username} looted ${goldToGive} gold and gained ${manaToGive} mana.`
        : `DUNGEON: ${rewards.name} has been slain. ${user.username} looted ${goldToGive} gold.`,
    );
  }

  await db.analytics.create({
    data: {
      triggerType: "dungeon_reward",
      xpChange: rewards.xp,
      goldChange: rewards.gold,
      guildName: rewards.guildName,
    },
  });
}
