import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAuth, requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";

export const getAbilityEfficiencyStatsMultiple = [
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
          const guildName =
            stat.guildName || stat.user?.guildName || "No Guild";
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
            xpPerMana:
              stats.totalMana > 0 ? stats.totalXp / stats.totalMana : 0,
            xpPerHealth:
              stats.totalHealth > 0 ? stats.totalXp / stats.totalHealth : 0,
            avgResourceCost:
              stats.count > 0 ? totalResourceCost / stats.count : 0,
            avgManaCost: stats.count > 0 ? stats.totalMana / stats.count : 0,
            avgHealthCost:
              stats.count > 0 ? stats.totalHealth / stats.count : 0,
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

      res.json({
        success: true,
        data: {
          today: processEfficiencyByGroup(today),
          week: processEfficiencyByGroup(sevenDaysAgo),
          twoWeeks: processEfficiencyByGroup(fourteenDaysAgo),
        },
      });
    } catch (error) {
      logger.error("Error fetching ability efficiency stats: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch ability efficiency stats",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
