import { Ability, User } from "lib/db.js";
import { PrismaTransaction } from "types/prismaTransaction.js";
import { addLog } from "../../logs/addLog.js";
import { experienceAndLevelValidator } from "../abilityValidators.js";
import { addAnalytics } from "../../analytics/addAnalytics.js";
import { ErrorMessage } from "../../../lib/error.js";

export const finalizeAbilityUsage = async (
  db: PrismaTransaction,
  user: User,
  ability: Ability,
) => {
  // should not be able to kill yourself with an ability
  if (ability.healthCost && user.hp - ability.healthCost <= 0) {
    throw new ErrorMessage("You cannot kill yourself with this ability");
  }

  // decrement cost of ability from user
  await db.user.update({
    where: {
      id: user.id,
    },
    data: {
      mana: {
        decrement: ability.manaCost || 0,
      },
      hp: {
        decrement: ability.healthCost || 0,
      },
    },
  });

  await addLog(db, user.id, `${user.username} used ${ability.name}`);
  if (ability.xpGiven)
    await experienceAndLevelValidator(db, user, ability.xpGiven!);

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
