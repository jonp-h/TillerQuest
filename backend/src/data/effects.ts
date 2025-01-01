import { db } from "../lib/db.js";
import { $Enums } from "@prisma/client";
import { removeAllOldEffects } from "./helpers.js";

// ---------------- Getters Helpers ----------------

export const getUserEffects = async (userId: string) => {
  try {
    await removeAllOldEffects();
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

export const getUserEffectsByType = async (userId: string, type: string) => {
  try {
    const effects = await db.effectsOnUser.findMany({
      where: {
        userId,
        effectType: type as $Enums.AbilityType,
      },
    });
    return effects;
  } catch {
    return null;
  }
};
