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
