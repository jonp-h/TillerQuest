"use server";

import { db } from "@/lib/db";

// Every call to the db should first check if the state of effects

const checkEffects = async () => {
  // if the effect is expired, remove it
  // TODO: could contain user id
  const effects = await db.effectsOnUser.findMany({
    where: {
      endTime: {
        lte: new Date(),
      },
    },
  });
  // if the effect is expired, remove it (but not passives, without an endTime)
  if (effects) {
    effects.forEach(async (effect) => {
      await db.effectsOnUser.delete({
        where: {
          id: effect.id,
          endTime: {
            not: undefined,
          },
        },
      });
    });
  }
};

export const getUserEffects = async (userId: string) => {
  try {
    await checkEffects();
    const effects = await db.effectsOnUser.findMany({
      where: {
        userId,
      },
      select: {
        endTime: true,
        ability: {
          select: {
            name: true,
            description: true,
            icon: true,
          },
        },
      },
    });
    return effects;
  } catch {
    return null;
  }
};
