import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAuth, requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import { validateQuery } from "middleware/validationMiddleware.js";
import z from "zod";

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
export const getAbilityBalanceReport = [
  requireAuth,
  requireAdmin,
  validateQuery(
    z.object({ days: z.coerce.number().min(1).max(90).optional() }),
  ),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const days = parseInt(req.query.days as string) || 14;

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
            ability.gemstoneCost > 0
              ? xpPerDayPerUser / ability.gemstoneCost
              : 0;

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
            avgResourceCost:
              (ability.manaCost || 0) + (ability.healthCost || 0),
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

      res.json({ success: true, data: [...balanceReport, ...unusedAbilities] });
    } catch (error) {
      logger.error("Error fetching ability balance report: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch ability balance report",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
