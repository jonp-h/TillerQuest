"use server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

export const getAllShopItems = async () => {
  const session = await auth();
  if (session?.user.role === "NEW" || !session) {
    return null;
  }

  try {
    return await db.shopItem.findMany({
      orderBy: [{ specialReq: "asc" }, { levelReq: "asc" }, { price: "asc" }],
    });
  } catch (error) {
    logger.error("Error fetching shopitems: " + error);
    return null;
  }
};

export const purchaseItem = async (userId: string, itemId: number) => {
  const session = await auth();
  if (!session || userId !== session?.user.id) {
    return new Error("Unauthorized");
  }

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
    throw new Error("Something went wrong");
  }

  const item = await db.shopItem.findUnique({ where: { id: itemId } });

  if (!item) {
    throw new Error("Something went wrong");
  }

  if (user.gold < item.price) {
    throw new Error("Not enough gold");
  }

  if (item.classReq && item.classReq !== user.class) {
    throw new Error("Class requirement not met");
  }

  if (item.levelReq && item.levelReq > user.level) {
    throw new Error("Level requirement not met");
  }

  if (item.specialReq) {
    if (!user.special.includes(item.specialReq)) {
      throw new Error("Special requirement not met");
    }
  }

  try {
    await db.user.update({
      where: { id: userId },
      data: {
        gold: user.gold - item.price,
        inventory: {
          connect: { id: itemId },
        },
      },
    });

    return "Sucessfully bought " + item.name;
  } catch (error) {
    logger.error("Error purchasing item: " + error);
    throw new Error("Something went wrong");
  }
};

export const equipItem = async (userId: string, itemId: number) => {
  const session = await auth();
  if (userId !== session?.user.id) {
    return "Unauthorized";
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { title: true, inventory: true },
  });

  if (!user) {
    return "Something went wrong";
  }

  const item = await db.shopItem.findUnique({ where: { id: itemId } });

  if (!item) {
    return "Something went wrong";
  }

  if (!user.inventory.some((inventoryItem) => inventoryItem.id === item.id)) {
    return "You don't own this item";
  }

  await db.user.update({
    where: { id: userId },
    data: {
      title: item.name,
    },
  });
  return "Sucessfully equipped " + item.name;
};
