"use server";

import { checkAdminAuth, AuthorizationError } from "@/lib/authUtils";
import { db } from "@/lib/db";
import { logger } from "better-auth";

export const adminGetWishes = async () => {
  try {
    await checkAdminAuth();

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

    return wishes;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized admin access attempt to get wishes");
      throw error;
    }

    logger.error("Error fetching wishes", error);
    throw new Error(
      "Failed to fetch wishes. Error timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

export const adminActivateWish = async (wishId: number, scheduleDate: Date) => {
  try {
    await checkAdminAuth();

    await db.wish.update({
      where: {
        id: wishId,
      },
      data: {
        scheduled: scheduleDate,
      },
    });

    return "Successfully activated wish.";
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized admin access attempt to update wish");
      throw error;
    }

    logger.error("Error updating wish", error);
    throw new Error(
      "Failed to fetch wish. Error timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

export const adminResetWish = async (wishId: number) => {
  try {
    await checkAdminAuth();

    await db.wish.update({
      where: {
        id: wishId,
      },
      data: {
        value: 0,
        wishVotes: {
          deleteMany: {},
        },
        scheduled: null,
      },
    });

    return "Successfully reset wish.";
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized admin access attempt to reset wish");
      throw error;
    }

    logger.error("Error resetting wish", error);
    throw new Error(
      "Failed to fetch wish. Error timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};
