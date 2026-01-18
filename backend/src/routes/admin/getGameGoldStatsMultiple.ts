import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";

export const getGameGoldStatsMultiple = [
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
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
          const guildName =
            stat.guildName || stat.user?.guildName || "No Guild";
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

      res.json({
        success: true,
        data: {
          today: processGameGoldByGroup(today),
          week: processGameGoldByGroup(sevenDaysAgo),
          twoWeeks: processGameGoldByGroup(fourteenDaysAgo),
        },
      });
    } catch (error) {
      logger.error("Error fetching game gold stats: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch game gold stats",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
