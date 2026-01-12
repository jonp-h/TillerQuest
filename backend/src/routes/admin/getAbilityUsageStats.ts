import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAuth, requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import { validateQuery } from "middleware/validationMiddleware.js";
import z from "zod";

export const getAbilityUsageStats = [
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

      res.json({ success: true, data: enrichedStats });
    } catch (error) {
      logger.error("Error fetching ability usage stats: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch ability usage stats",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
