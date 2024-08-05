"use server";

import { db } from "@/lib/db";
import { getUserAbilities } from "./abilities";

export const checkManaPassives = async (userId: string) => {
  const userAbilities = await getUserAbilities(userId);

  if (userAbilities === null) {
    return;
  }
  try {
    const abilities = await db.ability.findMany({
      where: {
        name: {
          in: userAbilities.map((userAbility) => userAbility.abilityName),
        },
        isPassive: true,
        type: "Mana",
      },
    });

    console.log(abilities);

    if (abilities.length === 0) {
      return;
    }
    abilities.sort((a, b) => (a.value ?? 0) - (b.value ?? 0));

    return abilities[0].value;
  } catch (error) {
    console.log(error);
    return 0;
  }
};

// export const checkManaPassives = (
//   userId: string,
//   userAbilities: Ability[]
// ): void => {

//   const manaPassives = userAbilities.filter(
//     (userAbility) => userAbility.type === "Mana" && userAbility.isPassive
//   );
//   if (manaPassives) useManaPassive(userId, manaPassives);
// };

// Mana passives

// const useManaPassive = async (userId: string, manaPassives: Ability[]) => {
//   manaPassives.sort((a, b) => (a.value ?? 0) - (b.value ?? 0));

//   return manaPassives[0].value;
// };

// const useManaPassive = async (userId: string, manaPassives: Ability[]) => {
//   try {
//     manaPassives.sort((a, b) => (a.value ?? 0) - (b.value ?? 0));

//     return db.user.update({
//       where: { id: userId },
//       data: { mana: { increment: manaPassives[0].value ?? 0 } },
//     });
//   } catch (error) {
//     return false;
//   }
// };

// Healing passives

// Damage passives
