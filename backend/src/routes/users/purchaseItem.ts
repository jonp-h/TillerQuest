import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { ErrorMessage } from "../../lib/error.js";
import { requireUserIdAndActive } from "../../middleware/authMiddleware.js";
import {
  validateBody,
  validateParams,
} from "middleware/validationMiddleware.js";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";
import {
  purchaseItemSchema,
  userIdParamSchema,
} from "utils/validators/validationUtils.js";

interface PurchaseItemRequest extends AuthenticatedRequest {
  body: {
    itemId: number;
  };
}

export const purchaseItem = [
  requireUserIdAndActive(),
  validateParams(userIdParamSchema),
  validateBody(purchaseItemSchema),
  async (req: PurchaseItemRequest, res: Response) => {
    try {
      const userId = req.params.userId;

      const { itemId } = req.body;

      const user = await db.user.findUnique({
        where: { id: userId },
        select: {
          gold: true,
          gemstones: true,
          inventory: true,
          class: true,
          level: true,
          special: true,
        },
      });

      if (!user) {
        throw new Error(
          "Didn't find user when purchasing item with userid " + userId,
        );
      }

      const item = await db.shopItem.findUnique({ where: { id: itemId } });

      if (!item) {
        throw new Error("Didn't find item when purchasing with id " + itemId);
      }

      if (
        user.inventory.some((inventoryItem) => inventoryItem.id === item.id)
      ) {
        throw new ErrorMessage("You already own this item");
      }

      if (user.gold < item.price) {
        throw new ErrorMessage("Not enough gold");
      }

      if (item.classReq && item.classReq !== user.class) {
        throw new ErrorMessage("Class requirement not met");
      }

      if (item.levelReq && item.levelReq > user.level) {
        throw new ErrorMessage("Level requirement not met");
      }

      if (item.specialReq) {
        if (!user.special.includes(item.specialReq)) {
          throw new ErrorMessage("Special requirement not met");
        }
      }

      // -------- Purchase with GEMSTONES --------
      if (item.currency === "GEMSTONES") {
        if (item.gemstonesSpentReq) {
          let gemStonesSpent = 0;
          user.inventory.forEach((inventoryItem) => {
            if (inventoryItem.currency === "GEMSTONES") {
              gemStonesSpent += inventoryItem.price;
            }
          });

          if (gemStonesSpent < item.gemstonesSpentReq) {
            throw new ErrorMessage(
              `You need to have spent at least ${item.gemstonesSpentReq.toLocaleString()} gemstones in the shop to buy this item`,
            );
          }
        }

        if (user.gemstones < item.price) {
          throw new ErrorMessage("Not enough gemstones");
        }

        await db.user.update({
          where: { id: userId },
          data: {
            gemstones: user.gemstones - item.price,
            inventory: {
              connect: { id: itemId },
            },
          },
        });
        res.json({
          success: true,
          data: "Successfully bought " + item.name,
        });
        return;
      }

      // -------- Purchase with GOLD --------
      await db.user.update({
        where: { id: userId },
        data: {
          gold: user.gold - item.price,
          inventory: {
            connect: { id: itemId },
          },
        },
      });

      res.json({
        success: true,
        data: "Successfully bought " + item.name,
      });
    } catch (error) {
      if (error instanceof ErrorMessage) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
        return;
      }

      logger.error("Unexpected error when purchasing item:", {
        error: error instanceof Error ? error.message : String(error),
        userId: req.params.userId,
        stack: error instanceof Error ? error.stack : undefined,
      });

      res.status(500).json({
        success: false,
        error: "Failed to purchase item. Please contact a game master.",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
