import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import {
  requireAuth,
  requireActiveUser,
} from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";

export const getWishes = [
  requireAuth,
  requireActiveUser,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const wishes = await db.wish.findMany({
        orderBy: { value: "desc" },
        select: {
          id: true,
          name: true,
          description: true,
          image: true,
          value: true,
          scheduled: true,
          wishVotes: {
            orderBy: { amount: "desc" },
            select: {
              anonymous: true,
              amount: true,
              user: {
                select: { username: true },
              },
            },
          },
        },
      });

      // Anonymize votes
      const sanitizedWishes = wishes.map((wish) => ({
        ...wish,
        wishVotes: wish.wishVotes.map((vote) => ({
          ...vote,
          user: {
            username: vote.anonymous ? "Anonymous" : vote.user.username,
          },
        })),
      }));

      res.json({ success: true, data: sanitizedWishes });
    } catch (error) {
      logger.error("Error fetching wishes:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch wishes",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
