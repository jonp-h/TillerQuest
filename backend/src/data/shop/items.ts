"use server";

import {
  AuthorizationError,
  validateActiveUserAuth,
  validateUserIdAndActiveUserAuth,
} from "@/lib/authUtils";
import { db } from "@/lib/db";
import { ErrorMessage } from "@/lib/error";
import { logger } from "@/lib/logger";
import { ServerActionResult } from "@/types/serverActionResult";

export const getShopTitles = async () => {
  try {
    await validateActiveUserAuth();

    return await db.shopItem.findMany({
      where: { type: "Title" },
      orderBy: [{ rarity: "asc" }, { price: "asc" }, { levelReq: "asc" }],
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access to shop items: " + error);
      throw error;
    }

    logger.error("Error fetching shopitems: " + error);
    throw new Error(
      "Something went wrong while fetching shop items. Please inform a game master of the following timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

export const getShopBadges = async () => {
  try {
    await validateActiveUserAuth();

    return await db.shopItem.findMany({
      where: { type: "Badge" },
      orderBy: [{ rarity: "asc" }, { price: "asc" }, { levelReq: "asc" }],
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access to shop items: " + error);
      throw error;
    }

    logger.error("Error fetching shopitems: " + error);
    throw new Error(
      "Something went wrong while fetching shop items. Please inform a game master of the following timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

export const getShopObjects = async () => {
  try {
    await validateActiveUserAuth();

    return await db.shopItem.findMany({
      where: { type: "Object" },
      orderBy: [{ rarity: "asc" }, { price: "asc" }, { levelReq: "asc" }],
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access to shop items: " + error);
      throw error;
    }

    logger.error("Error fetching shopitems: " + error);
    throw new Error(
      "Something went wrong while fetching shop items. Please inform a game master of the following timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

export const purchaseItem = async (
  userId: string,
  itemId: number,
): Promise<ServerActionResult> => {
  try {
    await validateUserIdAndActiveUserAuth(userId);

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        gold: true,
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

    await db.user.update({
      where: { id: userId },
      data: {
        gold: user.gold - item.price,
        inventory: {
          connect: { id: itemId },
        },
      },
    });

    return { success: true, data: "Sucessfully bought " + item.name };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access to purchase item: " + error);
      return {
        success: false,
        error: error.message,
      };
    }

    if (error instanceof ErrorMessage) {
      return { success: false, error: error.message };
    }

    logger.error("Error purchasing item: " + error);
    return {
      success: false,
      error:
        "Something went wrong. Please inform a game master of the following timestamp: " +
        Date.now().toLocaleString("no-NO"),
    };
  }
};

export const equipItem = async (
  userId: string,
  itemId: number,
): Promise<ServerActionResult> => {
  try {
    validateUserIdAndActiveUserAuth(userId);

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { title: true, inventory: true },
    });

    if (!user) {
      throw new Error("Didn't find user when equipping item with id " + userId);
    }

    const item = await db.shopItem.findUnique({ where: { id: itemId } });

    if (!item) {
      throw new Error("Didn't find item when equipping with id " + itemId);
    }

    if (!user.inventory.some((inventoryItem) => inventoryItem.id === item.id)) {
      throw new ErrorMessage("You don't own this item");
    }

    await db.user.update({
      where: { id: userId },
      data: {
        title: item.name,
        titleRarity: item.rarity,
      },
    });
    return { success: true, data: "Sucessfully equipped " + item.name };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access to equip item: " + error);
      return {
        success: false,
        error: error.message,
      };
    }

    if (error instanceof ErrorMessage) {
      return {
        success: false,
        error: error.message,
      };
    }

    logger.error("Error equipping item: " + error);
    return {
      success: false,
      error:
        "Something went wrong while equipping item. Please inform a game master of the following timestamp: " +
        Date.now().toLocaleString("no-NO"),
    };
  }
};
