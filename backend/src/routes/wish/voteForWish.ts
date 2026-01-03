import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { ErrorMessage } from "../../lib/error.js";
import { requireUserIdAndActive } from "../../middleware/authMiddleware.js";
import {
  validateBody,
  validateParams,
} from "middleware/validationMiddleware.js";
import {
  userIdParamSchema,
  voteForWishSchema,
} from "utils/validators/validationUtils.js";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";

export const voteForWish = [
  requireUserIdAndActive(),
  validateParams(userIdParamSchema),
  validateBody(voteForWishSchema),
  async (req: AuthenticatedRequest, res: Response) => {
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
        res.status(400).json({
          success: false,
          error: error.message,
        });
        return;
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
