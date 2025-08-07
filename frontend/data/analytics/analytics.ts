"use server";

import { db } from "@/lib/db";
import {
  AuthorizationError,
  validateAdminAuth,
  validateUserIdAndActiveUserAuth,
} from "@/lib/authUtils";
import { PrismaTransaction } from "@/types/prismaTransaction";
import { logger } from "@/lib/logger";

/**
 * Adds an analytics record to the database for a specific user and trigger event.
 *
 * @param db - The Prisma transaction client used to perform the database operation.
 * @param userId - The unique identifier of the user associated with the analytics event.
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
    // Users can only add analytics for themselves, not others. Only active users can add analytics.
    const session = await validateUserIdAndActiveUserAuth(userId);

    // Analytics are only tracking users
    if (session.user.role !== "USER") {
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
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access attempt to add analytics");
      throw error;
    }
    logger.error("Failed to add analytics:", error);
    throw new Error("Failed to add analytics record");
  }
};

export const getAbilityUsageStats = async (days: number = 14) => {
  try {
    await validateAdminAuth();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await db.analytics.groupBy({
      by: ["abilityId"],
      where: {
        triggerType: "ability_use",
        createdAt: { gte: startDate },
      },
      _count: {
        id: true,
      },
      _avg: {
        manaCost: true,
        xpChange: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 20,
    });

    // Join with ability data
    const enrichedStats = await Promise.all(
      stats.map(async (stat) => {
        const ability = await db.ability.findUnique({
          where: { id: stat.abilityId || 0 },
          select: { name: true, category: true },
        });
        return {
          ...stat,
          ability,
        };
      }),
    );

    return enrichedStats;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access attempt to get ability usage stats");
      throw error;
    }
    logger.error("Failed to get ability usage stats:", error);
    throw new Error("Failed to retrieve ability usage statistics");
  }
};

export const getResourceAverages = async () => {
  try {
    await validateAdminAuth();

    const userAverages = await db.user.aggregate({
      _avg: {
        hp: true,
        mana: true,
        xp: true,
        gold: true,
      },
      where: {
        role: "USER",
      },
    });

    const guildAverages = await db.user.groupBy({
      by: ["guildName"],
      _avg: {
        hp: true,
        mana: true,
        xp: true,
        gold: true,
      },
      where: {
        role: "USER",
        guildName: { not: null },
        guild: {
          archived: false, // Only include guilds that are not archived
        },
      },
    });

    const classAverages = await db.user.groupBy({
      by: ["class"],
      _avg: {
        hp: true,
        mana: true,
        xp: true,
        gold: true,
      },
      where: {
        role: "USER",
        class: { not: null },
      },
    });

    return {
      overall: userAverages,
      byGuild: guildAverages,
      byClass: classAverages,
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access attempt to get resource averages");
      throw error;
    }
    logger.error("Failed to get resource averages:", error);
    throw new Error("Failed to retrieve resource averages");
  }
};

export const getResourceGainStatsMultiple = async () => {
  try {
    await validateAdminAuth();

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const fourteenDaysAgo = new Date(today);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    // Get all resource gain data for the last 14 days with user details
    const allStats = await db.analytics.findMany({
      where: {
        createdAt: { gte: fourteenDaysAgo },
        OR: [
          { triggerType: "ability_use" },
          { triggerType: "daily_mana" },
          { triggerType: "xp_gain" },
          { triggerType: "gold_gain" },
        ],
      },
      select: {
        userId: true,
        createdAt: true,
        xpChange: true,
        goldChange: true,
        manaChange: true,
        userClass: true,
        guildName: true,
        user: {
          select: {
            username: true,
            class: true,
            guildName: true,
          },
        },
      },
    });

    // Process data for different time periods and groupings
    const processStatsByGroup = (filterDate: Date) => {
      const filteredStats = allStats.filter(
        (stat) => new Date(stat.createdAt) >= filterDate,
      );

      // Group by different categories
      const byUser = new Map<
        string,
        {
          xpChange: number;
          goldChange: number;
          manaChange: number;
          username: string;
        }
      >();
      const byClass = new Map<
        string,
        { xpChange: number; goldChange: number; manaChange: number }
      >();
      const byGuild = new Map<
        string,
        { xpChange: number; goldChange: number; manaChange: number }
      >();

      let totalXp = 0;
      let totalGold = 0;
      let totalMana = 0;

      filteredStats.forEach((stat) => {
        const xpChange = stat.xpChange || 0;
        const goldChange = stat.goldChange || 0;
        const manaChange = stat.manaChange || 0;

        // Overall totals
        totalXp += xpChange;
        totalGold += goldChange;
        totalMana += manaChange;

        // Group by user
        if (!byUser.has(stat.userId)) {
          byUser.set(stat.userId, {
            xpChange: 0,
            goldChange: 0,
            manaChange: 0,
            username: stat.user?.username || "Unknown User",
          });
        }
        const userStats = byUser.get(stat.userId)!;
        userStats.xpChange += xpChange;
        userStats.goldChange += goldChange;
        userStats.manaChange += manaChange;

        // Group by class
        const userClass = stat.userClass || stat.user?.class || "Unknown";
        if (!byClass.has(userClass)) {
          byClass.set(userClass, { xpChange: 0, goldChange: 0, manaChange: 0 });
        }
        const classStats = byClass.get(userClass)!;
        classStats.xpChange += xpChange;
        classStats.goldChange += goldChange;
        classStats.manaChange += manaChange;

        // Group by guild
        const guildName = stat.guildName || stat.user?.guildName || "No Guild";
        if (!byGuild.has(guildName)) {
          byGuild.set(guildName, { xpChange: 0, goldChange: 0, manaChange: 0 });
        }
        const guildStats = byGuild.get(guildName)!;
        guildStats.xpChange += xpChange;
        guildStats.goldChange += goldChange;
        guildStats.manaChange += manaChange;
      });

      return {
        overall: {
          xpChange: totalXp,
          goldChange: totalGold,
          manaChange: totalMana,
        },
        byUser: Array.from(byUser.entries()).map(([userId, stats]) => ({
          userId,
          xpChange: stats.xpChange,
          goldChange: stats.goldChange,
          manaChange: stats.manaChange,
          username: stats.username,
        })),
        byClass: Array.from(byClass.entries()).map(([className, stats]) => ({
          class: className,
          ...stats,
        })),
        byGuild: Array.from(byGuild.entries()).map(([guildName, stats]) => ({
          guildName,
          ...stats,
        })),
      };
    };

    return {
      today: processStatsByGroup(today),
      week: processStatsByGroup(sevenDaysAgo),
      twoWeeks: processStatsByGroup(fourteenDaysAgo),
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access attempt to get resource gain stats");
      throw error;
    }
    logger.error("Failed to get resource gain stats:", error);
    throw new Error("Failed to retrieve resource gain statistics");
  }
};

export const getManaEfficiencyStats = async () => {
  try {
    await validateAdminAuth();

    const efficiency = await db.analytics.groupBy({
      by: ["abilityId"],
      where: {
        triggerType: "ability_use",
        manaCost: { gt: 0 },
        xpChange: { gt: 0 },
      },
      _avg: {
        manaCost: true,
        xpChange: true,
      },
      _count: {
        id: true,
      },
    });

    const enrichedEfficiency = await Promise.all(
      efficiency.map(async (stat) => {
        const ability = await db.ability.findUnique({
          where: { id: stat.abilityId || 0 },
          select: { name: true, category: true },
        });

        const xpPerMana = stat._avg.xpChange! / stat._avg.manaCost!;

        return {
          ...stat,
          ability,
          xpPerMana,
          usageCount: stat._count.id,
        };
      }),
    );

    return enrichedEfficiency.sort((a, b) => b.xpPerMana - a.xpPerMana);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access attempt to get mana efficiency stats");
      throw error;
    }
    logger.error("Failed to get mana efficiency stats:", error);
    throw new Error("Failed to retrieve mana efficiency statistics");
  }
};

export const getManaEfficiencyStatsMultiple = async () => {
  try {
    await validateAdminAuth();

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const fourteenDaysAgo = new Date(today);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    // Get all mana efficiency data for the last 14 days
    const allStats = await db.analytics.findMany({
      where: {
        triggerType: "ability_use",
        manaCost: { gt: 0 },
        xpChange: { gt: 0 },
        createdAt: { gte: fourteenDaysAgo },
      },
      select: {
        abilityId: true,
        createdAt: true,
        manaCost: true,
        xpChange: true,
        userClass: true,
        guildName: true,
        ability: {
          select: {
            name: true,
            category: true,
          },
        },
        user: {
          select: {
            username: true,
            class: true,
            guildName: true,
          },
        },
      },
    });

    // Process data for different time periods and groupings
    const processEfficiencyByGroup = (filterDate: Date) => {
      const filteredStats = allStats.filter(
        (stat) => new Date(stat.createdAt) >= filterDate,
      );

      // Group by different categories
      const byAbility = new Map<
        number,
        {
          totalMana: number;
          totalXp: number;
          count: number;
          ability: { name: string; category: string };
        }
      >();
      const byCategory = new Map<
        string,
        { totalMana: number; totalXp: number; count: number }
      >();
      const byClass = new Map<
        string,
        { totalMana: number; totalXp: number; count: number }
      >();
      const byGuild = new Map<
        string,
        { totalMana: number; totalXp: number; count: number }
      >();

      let overallTotalMana = 0;
      let overallTotalXp = 0;
      let overallCount = 0;

      filteredStats.forEach((stat) => {
        const manaCost = stat.manaCost || 0;
        const xpChange = stat.xpChange || 0;

        // Overall totals
        overallTotalMana += manaCost;
        overallTotalXp += xpChange;
        overallCount += 1;

        // Group by ability
        const abilityId = stat.abilityId || 0;
        if (!byAbility.has(abilityId)) {
          byAbility.set(abilityId, {
            totalMana: 0,
            totalXp: 0,
            count: 0,
            ability: stat.ability ?? { name: "Unknown", category: "Unknown" },
          });
        }
        const abilityStats = byAbility.get(abilityId)!;
        abilityStats.totalMana += manaCost;
        abilityStats.totalXp += xpChange;
        abilityStats.count += 1;

        // Group by category
        const category = stat.ability?.category || "Unknown";
        if (!byCategory.has(category)) {
          byCategory.set(category, { totalMana: 0, totalXp: 0, count: 0 });
        }
        const categoryStats = byCategory.get(category)!;
        categoryStats.totalMana += manaCost;
        categoryStats.totalXp += xpChange;
        categoryStats.count += 1;

        // Group by class
        const userClass = stat.userClass || stat.user?.class || "Unknown";
        if (!byClass.has(userClass)) {
          byClass.set(userClass, { totalMana: 0, totalXp: 0, count: 0 });
        }
        const classStats = byClass.get(userClass)!;
        classStats.totalMana += manaCost;
        classStats.totalXp += xpChange;
        classStats.count += 1;

        // Group by guild
        const guildName = stat.guildName || stat.user?.guildName || "No Guild";
        if (!byGuild.has(guildName)) {
          byGuild.set(guildName, { totalMana: 0, totalXp: 0, count: 0 });
        }
        const guildStats = byGuild.get(guildName)!;
        guildStats.totalMana += manaCost;
        guildStats.totalXp += xpChange;
        guildStats.count += 1;
      });

      return {
        overall: {
          xpPerMana: overallCount > 0 ? overallTotalXp / overallTotalMana : 0,
          avgManaCost: overallCount > 0 ? overallTotalMana / overallCount : 0,
          avgXpGain: overallCount > 0 ? overallTotalXp / overallCount : 0,
          usageCount: overallCount,
        },
        byAbility: Array.from(byAbility.entries()).map(
          ([abilityId, stats]) => ({
            abilityId,
            ability: stats.ability,
            xpPerMana:
              stats.totalMana > 0 ? stats.totalXp / stats.totalMana : 0,
            avgManaCost: stats.count > 0 ? stats.totalMana / stats.count : 0,
            avgXpGain: stats.count > 0 ? stats.totalXp / stats.count : 0,
            usageCount: stats.count,
          }),
        ),
        byCategory: Array.from(byCategory.entries()).map(
          ([category, stats]) => ({
            category,
            xpPerMana:
              stats.totalMana > 0 ? stats.totalXp / stats.totalMana : 0,
            avgManaCost: stats.count > 0 ? stats.totalMana / stats.count : 0,
            avgXpGain: stats.count > 0 ? stats.totalXp / stats.count : 0,
            usageCount: stats.count,
          }),
        ),
        byClass: Array.from(byClass.entries()).map(([className, stats]) => ({
          class: className,
          xpPerMana: stats.totalMana > 0 ? stats.totalXp / stats.totalMana : 0,
          avgManaCost: stats.count > 0 ? stats.totalMana / stats.count : 0,
          avgXpGain: stats.count > 0 ? stats.totalXp / stats.count : 0,
          usageCount: stats.count,
        })),
        byGuild: Array.from(byGuild.entries()).map(([guildName, stats]) => ({
          guildName,
          xpPerMana: stats.totalMana > 0 ? stats.totalXp / stats.totalMana : 0,
          avgManaCost: stats.count > 0 ? stats.totalMana / stats.count : 0,
          avgXpGain: stats.count > 0 ? stats.totalXp / stats.count : 0,
          usageCount: stats.count,
        })),
      };
    };

    return {
      today: processEfficiencyByGroup(today),
      week: processEfficiencyByGroup(sevenDaysAgo),
      twoWeeks: processEfficiencyByGroup(fourteenDaysAgo),
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn(
        "Unauthorized access attempt to get mana efficiency stats multiple",
      );
      throw error;
    }
    logger.error("Failed to get mana efficiency stats multiple:", error);
    throw new Error("Failed to retrieve multiple mana efficiency statistics");
  }
};

export const getGameGoldStatsMultiple = async () => {
  try {
    await validateAdminAuth();

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const fourteenDaysAgo = new Date(today);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    // Get all game completion analytics data for the last 14 days
    const gameCompletionStats = await db.analytics.findMany({
      where: {
        createdAt: { gte: fourteenDaysAgo },
        triggerType: "game_completion",
        goldChange: { gt: 0 },
      },
      select: {
        userId: true,
        createdAt: true,
        goldChange: true,
        category: true, // This stores the game name
        userClass: true,
        guildName: true,
        user: {
          select: {
            username: true,
            class: true,
            guildName: true,
          },
        },
      },
    });

    // Process data for different time periods and groupings
    const processGameGoldByGroup = (filterDate: Date) => {
      const filteredStats = gameCompletionStats.filter(
        (stat) => new Date(stat.createdAt) >= filterDate,
      );

      // Group by different categories
      const byGame = new Map<
        string,
        { totalGold: number; gameCount: number }
      >();
      const byUser = new Map<
        string,
        { totalGold: number; gameCount: number; username: string }
      >();
      const byClass = new Map<
        string,
        { totalGold: number; gameCount: number }
      >();
      const byGuild = new Map<
        string,
        { totalGold: number; gameCount: number }
      >();

      let overallTotalGold = 0;
      let overallGameCount = 0;

      filteredStats.forEach((stat) => {
        const goldEarned = stat.goldChange || 0;
        const gameName = stat.category || "Unknown Game";

        overallTotalGold += goldEarned;
        overallGameCount += 1;

        // Group by game
        if (!byGame.has(gameName)) {
          byGame.set(gameName, { totalGold: 0, gameCount: 0 });
        }
        const gameStats = byGame.get(gameName)!;
        gameStats.totalGold += goldEarned;
        gameStats.gameCount += 1;

        // Group by user
        if (!byUser.has(stat.userId)) {
          byUser.set(stat.userId, {
            totalGold: 0,
            gameCount: 0,
            username: stat.user?.username || "Unknown User",
          });
        }
        const userStats = byUser.get(stat.userId)!;
        userStats.totalGold += goldEarned;
        userStats.gameCount += 1;

        // Group by class
        const userClass = stat.userClass || stat.user?.class || "Unknown";
        if (!byClass.has(userClass)) {
          byClass.set(userClass, { totalGold: 0, gameCount: 0 });
        }
        const classStats = byClass.get(userClass)!;
        classStats.totalGold += goldEarned;
        classStats.gameCount += 1;

        // Group by guild
        const guildName = stat.guildName || stat.user?.guildName || "No Guild";
        if (!byGuild.has(guildName)) {
          byGuild.set(guildName, { totalGold: 0, gameCount: 0 });
        }
        const guildStats = byGuild.get(guildName)!;
        guildStats.totalGold += goldEarned;
        guildStats.gameCount += 1;
      });

      return {
        overall: {
          totalGold: overallTotalGold,
          avgGoldPerGame:
            overallGameCount > 0 ? overallTotalGold / overallGameCount : 0,
          gameCount: overallGameCount,
        },
        byGame: Array.from(byGame.entries()).map(([gameName, stats]) => ({
          gameName,
          totalGold: stats.totalGold,
          avgGoldPerGame:
            stats.gameCount > 0 ? stats.totalGold / stats.gameCount : 0,
          gameCount: stats.gameCount,
        })),
        byUser: Array.from(byUser.entries()).map(([userId, stats]) => ({
          userId,
          username: stats.username,
          totalGold: stats.totalGold,
          avgGoldPerGame:
            stats.gameCount > 0 ? stats.totalGold / stats.gameCount : 0,
          gameCount: stats.gameCount,
        })),
        byClass: Array.from(byClass.entries()).map(([className, stats]) => ({
          class: className,
          totalGold: stats.totalGold,
          avgGoldPerGame:
            stats.gameCount > 0 ? stats.totalGold / stats.gameCount : 0,
          gameCount: stats.gameCount,
        })),
        byGuild: Array.from(byGuild.entries()).map(([guildName, stats]) => ({
          guildName,
          totalGold: stats.totalGold,
          avgGoldPerGame:
            stats.gameCount > 0 ? stats.totalGold / stats.gameCount : 0,
          gameCount: stats.gameCount,
        })),
      };
    };

    return {
      today: processGameGoldByGroup(today),
      week: processGameGoldByGroup(sevenDaysAgo),
      twoWeeks: processGameGoldByGroup(fourteenDaysAgo),
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access attempt to get game gold stats");
      throw error;
    }
    logger.error("Failed to get game gold stats:", error);
    throw new Error("Failed to retrieve game gold statistics");
  }
};
