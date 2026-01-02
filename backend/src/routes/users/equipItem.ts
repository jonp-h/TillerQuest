import { Request, Response } from "express";
import { z } from "zod";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { ErrorMessage } from "../../lib/error.js";
import { requireUserIdAndActive } from "../../middleware/authMiddleware.js";
import { validateBody } from "middleware/validationMiddleware.js";

const equipItemSchema = z.object({
  itemId: z.number().int().positive("Id must be greater than zero"),
});

export const equipItem = [
  requireUserIdAndActive(),
  validateBody(equipItemSchema),
  async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;

      const { itemId } = req.body;

      const user = await db.user.findUnique({
        where: { id: userId },
        select: { title: true, inventory: true },
      });

      if (!user) {
        throw new Error(
          "Didn't find user when equipping item with id " + userId,
        );
      }

      const item = await db.shopItem.findUnique({ where: { id: itemId } });

      if (!item) {
        throw new Error("Didn't find item when equipping with id " + itemId);
      }

      if (
        !user.inventory.some((inventoryItem) => inventoryItem.id === item.id)
      ) {
        throw new ErrorMessage("You don't own this item");
      }

      await db.user.update({
        where: { id: userId },
        data: {
          title: item.name,
          titleRarity: item.rarity,
        },
      });

      res.json({
        success: true,
        data: "Successfully equipped " + item.name,
      });
    } catch (error) {
      if (error instanceof ErrorMessage) {
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }

      logger.error("Unexpected error when equipping item:", {
        error: error instanceof Error ? error.message : String(error),
        userId: req.params.userId,
        stack: error instanceof Error ? error.stack : undefined,
      });

      res.status(500).json({
        success: false,
        error: "Failed to equip item. Please contact a game master.",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
