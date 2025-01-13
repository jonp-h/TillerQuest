"use server";

import { db } from "@/lib/db";
import { $Enums } from "@prisma/client";

// ---------------- Getters Helpers ----------------

export const getUserPassives = async (userId: string) => {
  try {
    const passives = await db.userPassive.findMany({
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
    return passives;
  } catch {
    return null;
  }
};

export const getUserPassivesByType = async (userId: string, type: string) => {
  try {
    const passives = await db.userPassive.findMany({
      where: {
        userId,
        effectType: type as $Enums.AbilityType,
      },
    });
    return passives;
  } catch (error) {
    console.error("Error getting user passives by type " + error);
    return null;
  }
};
