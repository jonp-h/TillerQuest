import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";

export const adminGetWishes = [
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const wishes = await db.wish.findMany({
        include: {
          wishVotes: {
            orderBy: {
              amount: "desc",
            },
            select: {
              amount: true,
              user: {
                select: {
                  name: true,
                  lastname: true,
                },
              },
            },
          },
        },
        orderBy: {
          value: "desc",
        },
      });

      res.json({ success: true, data: wishes });
    } catch (error) {
      logger.error("Error fetching wishes: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch wishes",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
