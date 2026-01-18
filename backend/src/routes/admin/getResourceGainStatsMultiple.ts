import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";

export const getResourceGainStatsMultiple = [
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
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
            byClass.set(userClass, {
              xpChange: 0,
              goldChange: 0,
              manaChange: 0,
            });
          }
          const classStats = byClass.get(userClass)!;
          classStats.xpChange += xpChange;
          classStats.goldChange += goldChange;
          classStats.manaChange += manaChange;

          // Group by guild
          const guildName =
            stat.guildName || stat.user?.guildName || "No Guild";
          if (!byGuild.has(guildName)) {
            byGuild.set(guildName, {
              xpChange: 0,
              goldChange: 0,
              manaChange: 0,
            });
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

      res.json({
        success: true,
        data: {
          today: processStatsByGroup(today),
          week: processStatsByGroup(sevenDaysAgo),
          twoWeeks: processStatsByGroup(fourteenDaysAgo),
        },
      });
    } catch (error) {
      logger.error("Error fetching resource gain stats: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch resource gain stats",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
