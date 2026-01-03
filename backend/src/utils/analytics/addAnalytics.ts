import { PrismaTransaction } from "types/prismaTransaction.js";
import { logger } from "../../lib/logger.js";

/**
 * Adds an analytics record to the database for a specific user and trigger event.
 *
 * @param db - The Prisma transaction client used to perform the database operation.
 * @param userId - The unique identifier of the user associated with the analytics event.
 * @param role - The role of the user (e.g., "USER", "ADMIN").
 * @param triggerType - The type of event or trigger that caused the analytics record to be created.
 * @param data - An object containing optional analytics details such as category, gameId, abilityId, targetCount, hpChange, manaChange, xpChange, goldChange, manaCost, healthCost, gemstoneCost, userLevel, userClass, and guildName.
 *
 * @returns A promise that resolves when the analytics record has been successfully created.
 * @throws {AuthorizationError} If the user is not authorized to add analytics.
 * @throws {Error} If there is an error while adding the analytics record.
 */
export const addAnalytics = async (
  db: PrismaTransaction,
  userId: string,
  role: string,
  triggerType: string,
  data: {
    category?: string;
    gameId?: string;
    abilityId?: number;
    targetCount?: number;
    hpChange?: number;
    manaChange?: number;
    xpChange?: number;
    goldChange?: number;
    manaCost?: number;
    healthCost?: number;
    gemstoneCost?: number;
    userLevel?: number;
    userClass?: string;
    guildName?: string;
  },
) => {
  try {
    // Analytics are only tracking users
    if (role !== "USER") {
      return;
    }

    await db.analytics.create({
      data: {
        userId,
        triggerType,
        createdAt: new Date(),
        ...data,
      },
    });
  } catch (error) {
    logger.error("Failed to add analytics:", error);
    throw new Error("Failed to add analytics record");
  }
};
