import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAuth, requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";

export const getManaEfficiencyStats = [
  requireAuth,
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
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

      res.json({
        success: true,
        data: {
          enrichedEfficiency: enrichedEfficiency.sort(
            (a, b) => b.xpPerMana - a.xpPerMana,
          ),
        },
      });
    } catch (error) {
      logger.error("Error fetching mana efficiency stats: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch mana efficiency stats",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
