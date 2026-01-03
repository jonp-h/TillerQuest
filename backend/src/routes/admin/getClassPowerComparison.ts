import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAuth, requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import { validateQuery } from "middleware/validationMiddleware.js";
import z from "zod";

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
export const getClassPowerComparison = [
  requireAuth,
  requireAdmin,
  validateQuery(z.object({ days: z.number().min(1).max(90).optional() })),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const days = parseInt(req.query.days as string) || 14;

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

      res.json({
        success: true,
        data: {
          classes: classComparison.sort(
            (a, b) => b.xpPowerScore - a.xpPowerScore,
          ),
          averageXpPerDay: Number(avgXpPerDay.toFixed(2)),
          averageGoldPerDay: Number(avgGoldPerDay.toFixed(2)),
        },
      });
    } catch (error) {
      logger.error("Error fetching class power comparison: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch class power comparison",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
