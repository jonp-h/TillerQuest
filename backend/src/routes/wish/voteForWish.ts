import { Request, Response } from "express";
import { z } from "zod";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { ErrorMessage } from "../../lib/error.js";
import { requireUserIdAndActive } from "../../middleware/authMiddleware.js";
import { validateBody } from "middleware/validationMiddleware.js";

// Validation schema (could be in validators.ts if shared)
const voteForWishSchema = z.object({
  wishId: z.number().int().positive("Wish ID must be a positive integer"),
  amount: z
    .number()
    .int()
    .positive("Amount must be greater than zero")
    .max(10000, "Amount must not exceed 10000 gold"),
  anonymous: z.boolean().default(false),
});

export const voteForWish = [
  requireUserIdAndActive(),
  validateBody(voteForWishSchema),
  async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;

      const { wishId, amount, anonymous } = req.body;

      // Transaction logic
      const result = await db.$transaction(async (tx) => {
        const wish = await tx.wish.findUnique({
          where: { id: wishId },
          select: { id: true, name: true },
        });

        if (!wish) {
          throw new ErrorMessage("Wish not found");
        }

        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { gold: true },
        });

        if (!user) {
          throw new ErrorMessage("User not found");
        }

        if (user.gold < amount) {
          throw new ErrorMessage(
            "You do not have enough gold to vote this amount.",
          );
        }

        // Deduct gold
        await tx.user.update({
          where: { id: userId },
          data: { gold: { decrement: amount } },
        });

        // Upsert vote
        await tx.wishVote.upsert({
          where: { userId_wishId: { userId, wishId } },
          create: { userId, wishId, anonymous, amount },
          update: { amount: { increment: amount }, anonymous },
        });

        // Increment wish value
        await tx.wish.update({
          where: { id: wishId },
          data: { value: { increment: amount } },
        });

        return { wishName: wish.name };
      });

      logger.info("User voted for wish", { userId, wishId, amount, anonymous });

      res.json({
        success: true,
        data: `You threw ${amount} gold into the well! Hoping that ${result.wishName} might come true one day..`,
      });
    } catch (error) {
      if (error instanceof ErrorMessage) {
        logger.info("Wish vote validation error", {
          userId: req.params.userId,
          error: error.message,
        });
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }

      logger.error("Unexpected error voting for wish:", {
        error: error instanceof Error ? error.message : String(error),
        userId: req.params.userId,
        stack: error instanceof Error ? error.stack : undefined,
      });

      res.status(500).json({
        success: false,
        error: "Failed to vote for wish. Please contact a game master.",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
