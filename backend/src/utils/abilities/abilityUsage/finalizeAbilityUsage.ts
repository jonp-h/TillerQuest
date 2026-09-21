import { Ability, User } from "@tillerquest/prisma/browser";
import { Prisma } from "@tillerquest/prisma";
import { PrismaTransaction } from "../../../types/prismaTransaction.js";
import { addLog } from "../../logs/addLog.js";
import { experienceAndLevelValidator } from "../abilityValidators.js";
import { addAnalytics } from "../../analytics/addAnalytics.js";
import { ErrorMessage } from "../../../lib/error.js";

export const finalizeAbilityUsage = async (
  db: PrismaTransaction,
  user: User,
  ability: Ability,
) => {
  const manaCost = ability.manaCost || 0;
  const healthCost = ability.healthCost || 0;

  try {
    // conditions in where make the cost check and decrement atomic, closing the race between concurrent requests
    await db.user.update({
      where: {
        id: user.id,
        mana: { gte: manaCost },
        hp: { gt: healthCost },
      },
      data: {
        mana: { decrement: manaCost },
        hp: { decrement: healthCost },
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      // re-fetch to report which specific cost could no longer be afforded
      const current = await db.user.findUniqueOrThrow({
        where: { id: user.id },
      });
      if (current.mana < manaCost) {
        throw new ErrorMessage("Insufficient mana. The cost is " + manaCost);
      }
      throw new ErrorMessage("You cannot kill yourself with this ability");
    }
    throw error;
  }

  await addLog(db, user.id, `${user.username} used ${ability.name}`);
  if (ability.xpGiven)
    await experienceAndLevelValidator(db, user.id, ability.xpGiven!);

  await addAnalytics(db, user.id, user.role, "ability_use", {
    category: ability.category,
    abilityId: ability.id,

    hpChange: -(ability.healthCost || 0),
    manaChange: -(ability.manaCost || 0),
    xpChange: ability.xpGiven || 0,
    manaCost: ability.manaCost || 0,
    healthCost: ability.healthCost || 0,
    gemstoneCost: ability.gemstoneCost || 0,
    userLevel: user.level || 0,
    userClass: user.class || "",
    guildName: user.guildName || "",
  });
};
