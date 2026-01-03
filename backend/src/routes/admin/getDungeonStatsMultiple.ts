import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAuth, requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";

export const getDungeonStatsMultiple = [
  requireAuth,
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
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

      res.json({
        success: true,
        data: {
          today: processDungeonStatsByGroup(today),
          week: processDungeonStatsByGroup(sevenDaysAgo),
          twoWeeks: processDungeonStatsByGroup(fourteenDaysAgo),
        },
      });
    } catch (error) {
      logger.error("Error fetching dungeon stats: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch dungeon stats",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
