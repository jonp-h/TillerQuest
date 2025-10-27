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
        const userKey = stat.userId ?? "Unknown User";
        if (!byUser.has(userKey)) {
          byUser.set(userKey, {
            xpChange: 0,
            goldChange: 0,
            manaChange: 0,
            username: stat.user?.username || "Unknown User",
          });
        }
        const userStats = byUser.get(userKey)!;
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

export const getAbilityEfficiencyStatsMultiple = async () => {
  try {
    await validateAdminAuth();

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const fourteenDaysAgo = new Date(today);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    // Get all ability efficiency data for the last 14 days (both mana and health costs)
    const allStats = await db.analytics.findMany({
      where: {
        triggerType: "ability_use",
        xpChange: { gt: 0 },
        createdAt: { gte: fourteenDaysAgo },
        OR: [{ manaCost: { gt: 0 } }, { healthCost: { gt: 0 } }],
      },
      select: {
        abilityId: true,
        createdAt: true,
        manaCost: true,
        healthCost: true,
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
          totalHealth: number;
          totalXp: number;
          count: number;
          ability: { name: string; category: string };
        }
      >();
      const byCategory = new Map<
        string,
        {
          totalMana: number;
          totalHealth: number;
          totalXp: number;
          count: number;
        }
      >();
      const byClass = new Map<
        string,
        {
          totalMana: number;
          totalHealth: number;
          totalXp: number;
          count: number;
        }
      >();
      const byGuild = new Map<
        string,
        {
          totalMana: number;
          totalHealth: number;
          totalXp: number;
          count: number;
        }
      >();

      let overallTotalMana = 0;
      let overallTotalHealth = 0;
      let overallTotalXp = 0;
      let overallCount = 0;

      filteredStats.forEach((stat) => {
        const manaCost = stat.manaCost || 0;
        const healthCost = stat.healthCost || 0;
        const xpChange = stat.xpChange || 0;

        // Overall totals
        overallTotalMana += manaCost;
        overallTotalHealth += healthCost;
        overallTotalXp += xpChange;
        overallCount += 1;

        // Group by ability
        const abilityId = stat.abilityId || 0;
        if (!byAbility.has(abilityId)) {
          byAbility.set(abilityId, {
            totalMana: 0,
            totalHealth: 0,
            totalXp: 0,
            count: 0,
            ability: stat.ability ?? { name: "Unknown", category: "Unknown" },
          });
        }
        const abilityStats = byAbility.get(abilityId)!;
        abilityStats.totalMana += manaCost;
        abilityStats.totalHealth += healthCost;
        abilityStats.totalXp += xpChange;
        abilityStats.count += 1;

        // Group by category
        const category = stat.ability?.category || "Unknown";
        if (!byCategory.has(category)) {
          byCategory.set(category, {
            totalMana: 0,
            totalHealth: 0,
            totalXp: 0,
            count: 0,
          });
        }
        const categoryStats = byCategory.get(category)!;
        categoryStats.totalMana += manaCost;
        categoryStats.totalHealth += healthCost;
        categoryStats.totalXp += xpChange;
        categoryStats.count += 1;

        // Group by class
        const userClass = stat.userClass || stat.user?.class || "Unknown";
        if (!byClass.has(userClass)) {
          byClass.set(userClass, {
            totalMana: 0,
            totalHealth: 0,
            totalXp: 0,
            count: 0,
          });
        }
        const classStats = byClass.get(userClass)!;
        classStats.totalMana += manaCost;
        classStats.totalHealth += healthCost;
        classStats.totalXp += xpChange;
        classStats.count += 1;

        // Group by guild
        const guildName = stat.guildName || stat.user?.guildName || "No Guild";
        if (!byGuild.has(guildName)) {
          byGuild.set(guildName, {
            totalMana: 0,
            totalHealth: 0,
            totalXp: 0,
            count: 0,
          });
        }
        const guildStats = byGuild.get(guildName)!;
        guildStats.totalMana += manaCost;
        guildStats.totalHealth += healthCost;
        guildStats.totalXp += xpChange;
        guildStats.count += 1;
      });

      // Helper function to calculate efficiency metrics
      const calculateEfficiency = (stats: {
        totalMana: number;
        totalHealth: number;
        totalXp: number;
        count: number;
      }) => {
        const totalResourceCost = stats.totalMana + stats.totalHealth;
        return {
          xpPerResource:
            totalResourceCost > 0 ? stats.totalXp / totalResourceCost : 0,
          xpPerMana: stats.totalMana > 0 ? stats.totalXp / stats.totalMana : 0,
          xpPerHealth:
            stats.totalHealth > 0 ? stats.totalXp / stats.totalHealth : 0,
          avgResourceCost:
            stats.count > 0 ? totalResourceCost / stats.count : 0,
          avgManaCost: stats.count > 0 ? stats.totalMana / stats.count : 0,
          avgHealthCost: stats.count > 0 ? stats.totalHealth / stats.count : 0,
          avgXpGain: stats.count > 0 ? stats.totalXp / stats.count : 0,
          usageCount: stats.count,
        };
      };

      return {
        overall: calculateEfficiency({
          totalMana: overallTotalMana,
          totalHealth: overallTotalHealth,
          totalXp: overallTotalXp,
          count: overallCount,
        }),
        byAbility: Array.from(byAbility.entries()).map(
          ([abilityId, stats]) => ({
            abilityId,
            ability: stats.ability,
            ...calculateEfficiency(stats),
          }),
        ),
        byCategory: Array.from(byCategory.entries()).map(
          ([category, stats]) => ({
            category,
            ...calculateEfficiency(stats),
          }),
        ),
        byClass: Array.from(byClass.entries()).map(([className, stats]) => ({
          class: className,
          ...calculateEfficiency(stats),
        })),
        byGuild: Array.from(byGuild.entries()).map(([guildName, stats]) => ({
          guildName,
          ...calculateEfficiency(stats),
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
        "Unauthorized access attempt to get ability efficiency stats multiple",
      );
      throw error;
    }
    logger.error("Failed to get ability efficiency stats multiple:", error);
    throw new Error(
      "Failed to retrieve multiple ability efficiency statistics",
    );
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
        const userKey = stat.userId ?? "Unknown User";
        if (!byUser.has(userKey)) {
          byUser.set(userKey, {
            totalGold: 0,
            gameCount: 0,
            username: stat.user?.username || "Unknown User",
          });
        }
        const userStats = byUser.get(userKey)!;
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

export const getDungeonStatsMultiple = async () => {
  try {
    await validateAdminAuth();

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const fourteenDaysAgo = new Date(today);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    // Get all dungeon damage data for the last 14 days
    const dungeonDamageStats = await db.analytics.findMany({
      where: {
        createdAt: { gte: fourteenDaysAgo },
        triggerType: "dungeon_damage",
        guildName: { not: null },
      },
      select: {
        createdAt: true,
        guildName: true,
        value: true, // This contains the total damage taken
      },
    });

    // Get all dungeon reward data for the last 14 days
    const dungeonRewardStats = await db.analytics.findMany({
      where: {
        createdAt: { gte: fourteenDaysAgo },
        triggerType: "dungeon_reward",
        guildName: { not: null },
      },
      select: {
        createdAt: true,
        guildName: true,
        xpChange: true,
        goldChange: true,
      },
    });

    // Process data for different time periods and groupings
    const processDungeonStatsByGroup = (filterDate: Date) => {
      const filteredDamageStats = dungeonDamageStats.filter(
        (stat) => stat.createdAt >= filterDate,
      );
      const filteredRewardStats = dungeonRewardStats.filter(
        (stat) => stat.createdAt >= filterDate,
      );

      // Group damage data by guild
      const damageByGuild = filteredDamageStats.reduce(
        (acc, stat) => {
          if (!stat.guildName) return acc;
          if (!acc[stat.guildName]) {
            acc[stat.guildName] = {
              guildName: stat.guildName,
              totalDamage: 0,
              damageInstances: 0,
            };
          }
          acc[stat.guildName].totalDamage += stat.value || 0;
          acc[stat.guildName].damageInstances += 1;
          return acc;
        },
        {} as Record<
          string,
          {
            guildName: string;
            totalDamage: number;
            damageInstances: number;
          }
        >,
      );

      // Group reward data by guild
      const rewardsByGuild = filteredRewardStats.reduce(
        (acc, stat) => {
          if (!stat.guildName) return acc;
          if (!acc[stat.guildName]) {
            acc[stat.guildName] = {
              guildName: stat.guildName,
              totalXp: 0,
              totalGold: 0,
              rewardInstances: 0,
            };
          }
          acc[stat.guildName].totalXp += stat.xpChange || 0;
          acc[stat.guildName].totalGold += stat.goldChange || 0;
          acc[stat.guildName].rewardInstances += 1;
          return acc;
        },
        {} as Record<
          string,
          {
            guildName: string;
            totalXp: number;
            totalGold: number;
            rewardInstances: number;
          }
        >,
      );

      // Combine damage and reward data by guild
      const allGuilds = new Set([
        ...Object.keys(damageByGuild),
        ...Object.keys(rewardsByGuild),
      ]);

      const combinedStats = Array.from(allGuilds).map((guildName) => {
        const damage = damageByGuild[guildName] || {
          guildName,
          totalDamage: 0,
          damageInstances: 0,
        };
        const rewards = rewardsByGuild[guildName] || {
          guildName,
          totalXp: 0,
          totalGold: 0,
          rewardInstances: 0,
        };

        return {
          guildName,
          totalDamage: damage.totalDamage,
          averageDamage:
            damage.damageInstances > 0
              ? damage.totalDamage / damage.damageInstances
              : 0,
          damageInstances: damage.damageInstances,
          totalXp: rewards.totalXp,
          totalGold: rewards.totalGold,
          averageXp:
            rewards.rewardInstances > 0
              ? rewards.totalXp / rewards.rewardInstances
              : 0,
          averageGold:
            rewards.rewardInstances > 0
              ? rewards.totalGold / rewards.rewardInstances
              : 0,
          rewardInstances: rewards.rewardInstances,
        };
      });

      return combinedStats.sort((a, b) => b.totalDamage - a.totalDamage);
    };

    return {
      today: processDungeonStatsByGroup(today),
      week: processDungeonStatsByGroup(sevenDaysAgo),
      twoWeeks: processDungeonStatsByGroup(fourteenDaysAgo),
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access attempt to get dungeon stats");
      throw error;
    }
    logger.error("Failed to get dungeon stats multiple:", error);
    throw new Error("Failed to retrieve multiple dungeon statistics");
  }
};

/**
 * CRITICAL BALANCE DETECTION TOOL
 *
 * Get comprehensive balance report for all abilities, adjusted for duration.
 * This is the PRIMARY tool for detecting overpowered/underpowered abilities.
 *
 * Returns ability metrics including:
 * - Daily XP value per user (accounts for duration/cooldowns)
 * - Balance score (1.0 = perfect, >1.5 = overpowered, <0.5 = underpowered)
 * - Gemstone efficiency (daily XP per gemstone cost)
 * - Resource efficiency (XP per mana/health spent)
 *
 * @param days - Number of days to analyze (default: 14)
 * @returns Array of abilities sorted by balance score (most OP first)
 */
export const getAbilityBalanceReport = async (days: number = 14) => {
  try {
    await validateAdminAuth();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all ability usage with full details
    const abilityUsage = await db.analytics.findMany({
      where: {
        triggerType: "ability_use",
        createdAt: { gte: startDate },
        abilityId: { not: null },
      },
      select: {
        abilityId: true,
        userId: true,
        xpChange: true,
        manaCost: true,
        healthCost: true,
        gemstoneCost: true,
        createdAt: true,
      },
    });

    // Fetch all ability metadata from database
    const allAbilities = await db.ability.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        gemstoneCost: true,
        duration: true,
        manaCost: true,
        healthCost: true,
        xpGiven: true,
      },
    });

    // Map abilities by ID for quick lookup
    const abilityMap = new Map(
      allAbilities.map((a) => [
        a.id,
        {
          name: a.name,
          category: a.category,
          gemstoneCost: a.gemstoneCost,
          duration: a.duration, // in minutes
          designedManaCost: a.manaCost,
          designedHealthCost: a.healthCost,
          designedXpReward: a.xpGiven,
        },
      ]),
    );

    // Group analytics by ability
    const abilityStats = new Map<
      number,
      {
        timesUsed: number;
        uniqueUsers: Set<string>;
        totalXp: number;
        totalMana: number;
        totalHealth: number;
        totalGemstones: number;
        uses: Array<{ userId: string; date: Date }>;
      }
    >();

    abilityUsage.forEach((record) => {
      const id = record.abilityId!;
      if (!abilityStats.has(id)) {
        abilityStats.set(id, {
          timesUsed: 0,
          uniqueUsers: new Set(),
          totalXp: 0,
          totalMana: 0,
          totalHealth: 0,
          totalGemstones: 0,
          uses: [],
        });
      }

      const stats = abilityStats.get(id)!;
      stats.timesUsed += 1;
      stats.uniqueUsers.add(record.userId!);
      stats.totalXp += record.xpChange || 0;
      stats.totalMana += record.manaCost || 0;
      stats.totalHealth += record.healthCost || 0;
      stats.totalGemstones += record.gemstoneCost || 0;
      stats.uses.push({ userId: record.userId!, date: record.createdAt });
    });

    // Calculate balance metrics for each ability
    const balanceReport = Array.from(abilityStats.entries())
      .map(([abilityId, stats]) => {
        const ability = abilityMap.get(abilityId);
        if (!ability) return null;

        const uniqueUserCount = stats.uniqueUsers.size;
        const avgXpGained =
          stats.timesUsed > 0 ? stats.totalXp / stats.timesUsed : 0;
        const avgManaCost =
          stats.timesUsed > 0 ? stats.totalMana / stats.timesUsed : 0;
        const avgHealthCost =
          stats.timesUsed > 0 ? stats.totalHealth / stats.timesUsed : 0;
        const avgResourceCost = avgManaCost + avgHealthCost;

        // 🔥 CRITICAL: Calculate max uses per day based on duration (in minutes)
        let maxUsesPerDay: number;
        if (ability.duration === null) {
          // Permanent abilities - no XP expected
          maxUsesPerDay = 0;
        } else if (ability.duration === 0) {
          // Instant abilities - limited by mana pool (assume ~5 uses/day)
          maxUsesPerDay = 5;
        } else {
          // Duration-based abilities
          const durationInDays = ability.duration / 1440; // 1440 minutes = 1 day
          maxUsesPerDay = 1 / durationInDays;
        }

        // Calculate ACTUAL uses per day per user
        const avgUsesPerDayPerUser =
          uniqueUserCount > 0 ? stats.timesUsed / uniqueUserCount / days : 0;

        // KEY METRIC: Daily XP value per user
        const xpPerDayPerUser = avgUsesPerDayPerUser * avgXpGained;

        // Calculate theoretical max daily XP if used optimally
        const theoreticalMaxXpPerDay =
          maxUsesPerDay * (ability.designedXpReward || 0);

        // XP efficiency (actual XP per resource spent)
        const xpPerResource =
          avgResourceCost > 0 ? avgXpGained / avgResourceCost : 0;

        // Gemstone efficiency (daily XP value per gemstone cost)
        const xpPerGemstonePerDay =
          ability.gemstoneCost > 0 ? xpPerDayPerUser / ability.gemstoneCost : 0;

        // BALANCE SCORE: How much daily XP does this give relative to gemstone cost?
        // Target ranges based on gemstone cost:
        // 1-gem: ~10-15 XP/day
        // 2-gem: ~20-30 XP/day
        // 4-gem: ~40-60 XP/day
        let targetXpPerDay: number;
        if (ability.gemstoneCost === 1) targetXpPerDay = 12.5;
        else if (ability.gemstoneCost === 2) targetXpPerDay = 25;
        else if (ability.gemstoneCost === 4) targetXpPerDay = 50;
        else targetXpPerDay = 25; // Default for 0-gem abilities

        const balanceScore =
          targetXpPerDay > 0 && xpPerDayPerUser > 0
            ? xpPerDayPerUser / targetXpPerDay
            : 0;

        return {
          abilityId,
          name: ability.name,
          category: ability.category,
          gemstoneCost: ability.gemstoneCost,
          duration: ability.duration,

          // Usage stats
          timesUsed: stats.timesUsed,
          uniqueUsers: uniqueUserCount,
          avgUsesPerDayPerUser: Number(avgUsesPerDayPerUser.toFixed(2)),
          maxUsesPerDay: Number(maxUsesPerDay.toFixed(2)),

          // Resource efficiency
          avgXpGained: Number(avgXpGained.toFixed(1)),
          avgManaCost: Number(avgManaCost.toFixed(1)),
          avgHealthCost: Number(avgHealthCost.toFixed(1)),
          avgResourceCost: Number(avgResourceCost.toFixed(1)),
          xpPerResource: Number(xpPerResource.toFixed(2)),

          // 🎯 Daily value metrics (THE MOST IMPORTANT)
          xpPerDayPerUser: Number(xpPerDayPerUser.toFixed(2)),
          theoreticalMaxXpPerDay: Number(theoreticalMaxXpPerDay.toFixed(1)),
          xpPerGemstonePerDay: Number(xpPerGemstonePerDay.toFixed(2)),

          // 🚨 Balance indicators
          balanceScore: Number(balanceScore.toFixed(2)), // 1.0 = perfectly balanced
          targetXpPerDay: Number(targetXpPerDay.toFixed(1)),

          // Flags for easy filtering
          isPermanent: ability.duration === null,
          isOverpowered: balanceScore > 1.5,
          isUnderpowered: balanceScore < 0.5 && balanceScore > 0,
          isUnused: stats.timesUsed === 0,
        };
      })
      .filter((stat): stat is NonNullable<typeof stat> => stat !== null)
      .sort((a, b) => b.balanceScore - a.balanceScore);

    // Also include abilities that have ZERO usage (potential dead abilities)
    const usedAbilityIds = new Set(abilityStats.keys());
    const unusedAbilities = allAbilities
      .filter((ability) => !usedAbilityIds.has(ability.id))
      .map((ability) => {
        // Calculate theoretical values for unused abilities
        let maxUsesPerDay: number;
        if (ability.duration === null) {
          maxUsesPerDay = 0;
        } else if (ability.duration === 0) {
          maxUsesPerDay = 5;
        } else {
          const durationInDays = ability.duration / 1440;
          maxUsesPerDay = 1 / durationInDays;
        }

        const theoreticalMaxXpPerDay = maxUsesPerDay * (ability.xpGiven || 0);

        let targetXpPerDay: number;
        if (ability.gemstoneCost === 1) targetXpPerDay = 12.5;
        else if (ability.gemstoneCost === 2) targetXpPerDay = 25;
        else if (ability.gemstoneCost === 4) targetXpPerDay = 50;
        else targetXpPerDay = 25;

        return {
          abilityId: ability.id,
          name: ability.name,
          category: ability.category,
          gemstoneCost: ability.gemstoneCost,
          duration: ability.duration,

          // All zeros for unused
          timesUsed: 0,
          uniqueUsers: 0,
          avgUsesPerDayPerUser: 0,
          maxUsesPerDay: Number(maxUsesPerDay.toFixed(2)),

          avgXpGained: ability.xpGiven || 0,
          avgManaCost: ability.manaCost || 0,
          avgHealthCost: ability.healthCost || 0,
          avgResourceCost: (ability.manaCost || 0) + (ability.healthCost || 0),
          xpPerResource:
            (ability.manaCost || 0) + (ability.healthCost || 0) > 0
              ? (ability.xpGiven || 0) /
                ((ability.manaCost || 0) + (ability.healthCost || 0))
              : 0,

          xpPerDayPerUser: 0, // Never used
          theoreticalMaxXpPerDay: Number(theoreticalMaxXpPerDay.toFixed(1)),
          xpPerGemstonePerDay: 0,

          balanceScore: 0, // Can't measure if never used
          targetXpPerDay: Number(targetXpPerDay.toFixed(1)),

          isPermanent: ability.duration === null,
          isOverpowered: false,
          isUnderpowered: false,
          isUnused: true, // 🚨 Flag for dead abilities
        };
      });

    return [...balanceReport, ...unusedAbilities];
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access attempt to get ability balance report");
      throw error;
    }
    logger.error("Failed to get ability balance report:", error);
    throw new Error("Failed to retrieve ability balance report");
  }
};

/**
 * CLASS POWER COMPARISON
 *
 * Compare average daily XP/Gold gain across all classes.
 * Classes should be within ±15% of each other for balanced gameplay.
 *
 * Returns per-class metrics including:
 * - Average XP per user per day
 * - Average gold per user per day
 * - Power scores (1.0 = average, >1.15 = overpowered, <0.85 = underpowered)
 *
 * @param days - Number of days to analyze (default: 14)
 * @returns Class comparison data with power scores
 */
export const getClassPowerComparison = async (days: number = 14) => {
  try {
    await validateAdminAuth();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all XP and gold gains by class
    const analytics = await db.analytics.findMany({
      where: {
        createdAt: { gte: startDate },
        OR: [
          { triggerType: "ability_use" },
          { triggerType: "xp_gain" },
          { triggerType: "gold_gain" },
          { triggerType: "game_completion" },
        ],
        userClass: { not: null },
      },
      select: {
        userId: true,
        userClass: true,
        xpChange: true,
        goldChange: true,
        createdAt: true,
      },
    });

    // Group by class
    const classSummary = new Map<
      string,
      {
        totalXp: number;
        totalGold: number;
        uniqueUsers: Set<string>;
      }
    >();

    analytics.forEach((record) => {
      const className = record.userClass!;
      if (!classSummary.has(className)) {
        classSummary.set(className, {
          totalXp: 0,
          totalGold: 0,
          uniqueUsers: new Set(),
        });
      }

      const stats = classSummary.get(className)!;
      stats.totalXp += record.xpChange || 0;
      stats.totalGold += record.goldChange || 0;
      stats.uniqueUsers.add(record.userId!);
    });

    // Calculate per-class metrics
    const classStats = Array.from(classSummary.entries()).map(
      ([className, stats]) => {
        const userCount = stats.uniqueUsers.size;
        const xpPerUserPerDay =
          userCount > 0 ? stats.totalXp / userCount / days : 0;
        const goldPerUserPerDay =
          userCount > 0 ? stats.totalGold / userCount / days : 0;

        return {
          class: className,
          totalXp: stats.totalXp,
          totalGold: stats.totalGold,
          uniqueUsers: userCount,
          xpPerUserPerDay: Number(xpPerUserPerDay.toFixed(2)),
          goldPerUserPerDay: Number(goldPerUserPerDay.toFixed(2)),
        };
      },
    );

    // Calculate average across all classes
    const avgXpPerDay =
      classStats.length > 0
        ? classStats.reduce((sum, c) => sum + c.xpPerUserPerDay, 0) /
          classStats.length
        : 0;
    const avgGoldPerDay =
      classStats.length > 0
        ? classStats.reduce((sum, c) => sum + c.goldPerUserPerDay, 0) /
          classStats.length
        : 0;

    // Add power score (relative to average)
    const classComparison = classStats.map((stats) => ({
      ...stats,
      xpPowerScore:
        avgXpPerDay > 0
          ? Number((stats.xpPerUserPerDay / avgXpPerDay).toFixed(2))
          : 0,
      goldPowerScore:
        avgGoldPerDay > 0
          ? Number((stats.goldPerUserPerDay / avgGoldPerDay).toFixed(2))
          : 0,
      isOverpowered: stats.xpPerUserPerDay > avgXpPerDay * 1.15, // 🚨 >15% above average
      isUnderpowered: stats.xpPerUserPerDay < avgXpPerDay * 0.85, // 🚨 >15% below average
    }));

    return {
      classes: classComparison.sort((a, b) => b.xpPowerScore - a.xpPowerScore),
      averageXpPerDay: Number(avgXpPerDay.toFixed(2)),
      averageGoldPerDay: Number(avgGoldPerDay.toFixed(2)),
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access attempt to get class power comparison");
      throw error;
    }
    logger.error("Failed to get class power comparison:", error);
    throw new Error("Failed to retrieve class power comparison");
  }
};
