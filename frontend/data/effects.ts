"use server";

import { db } from "@/lib/db";
import { $Enums } from "@prisma/client";

// ---------------- Getters Helpers ----------------

export const getUserEffects = async (userId: string) => {
  try {
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
    console.error("Error getting user effects by type");
    return null;
  }
};
