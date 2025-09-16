"use server";

import { validateAdminAuth, AuthorizationError } from "@/lib/authUtils";
import { db } from "@/lib/db";
import { ServerActionResult } from "@/types/serverActionResult";
import { logger } from "better-auth";

export const adminGetWishes = async () => {
  try {
    await validateAdminAuth();

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

export const adminActivateWish = async (
  wishId: number,
  scheduleDate: Date,
): Promise<ServerActionResult> => {
  try {
    await validateAdminAuth();

    await db.wish.update({
      where: {
        id: wishId,
      },
      data: {
        scheduled: scheduleDate,
      },
    });

    return { success: true, data: "Successfully activated wish." };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized admin access attempt to update wish");
      return {
        success: false,
        error: error.message,
      };
    }

    logger.error("Error updating wish", error);
    return {
      success: false,
      error:
        "Failed to fetch wish. Error timestamp: " +
        Date.now().toLocaleString("no-NO"),
    };
  }
};

export const adminResetWish = async (
  wishId: number,
): Promise<ServerActionResult> => {
  try {
    await validateAdminAuth();

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

    return { success: true, data: "Successfully reset wish." };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized admin access attempt to reset wish");
      return {
        success: false,
        error: error.message,
      };
    }

    logger.error("Error resetting wish", error);
    return {
      success: false,
      error:
        "Failed to fetch wish. Error timestamp: " +
        Date.now().toLocaleString("no-NO"),
    };
  }
};
