"use server";

import {
  checkActiveUserAuth,
  AuthorizationError,
  checkUserIdAndActiveAuth,
} from "@/lib/authUtils";
import { db } from "@/lib/db";
import { ErrorMessage } from "@/lib/error";
import { logger } from "better-auth";

export const getWishes = async () => {
  try {
    await checkActiveUserAuth();
    const wishes = await db.wish.findMany({
      orderBy: {
        value: "desc",
      },
      include: {
        wishVotes: {
          orderBy: {
            amount: "desc",
          },
          select: {
            userId: true,
            username: true,
            amount: true,
          },
        },
      },
    });

    return wishes;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access attempt to get wishes: " + error);
      throw error;
    }

    logger.error("Error fetching wishes: " + error);
    throw new Error(
      "Something went wrong while fetching wishes. Please inform a game master of the following timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

export const voteForWish = async (
  wishId: number,
  userId: string,
  amount: number,
  anonymous: boolean = false,
) => {
  try {
    const {
      user: { username },
    } = await checkUserIdAndActiveAuth(userId);
    const wish = await db.wish.findUnique({
      where: { id: wishId },
    });

    if (!wish) {
      throw new ErrorMessage("Wish not found");
    }
    if (amount <= 0) {
      throw new ErrorMessage("Amount must be greater than zero");
    }

    const user = await db.user.findUnique({
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

    await db.user.update({
      where: { id: userId },
      data: {
        gold: {
          decrement: amount,
        },
      },
    });

    const displayName = anonymous ? "Anonymous" : username;

    // Upsert the user's vote for the wish
    await db.wishVote.upsert({
      where: {
        userId_wishId: {
          userId,
          wishId,
        },
      },
      create: {
        userId,
        wishId,
        username: displayName,
        amount,
      },
      update: {
        amount: {
          increment: amount,
        },
        username: displayName,
      },
    });

    // Increment the wish's value by the voted amount
    await db.wish.update({
      where: { id: wishId },
      data: {
        value: {
          increment: amount,
        },
      },
    });

    return "You successfully threw " + amount + " gold into the well!";
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access attempt to vote for wish: " + error);
      throw error;
    }

    if (error instanceof ErrorMessage) {
      logger.warn("Error voting for wish: " + error.message);
      throw error;
    }

    logger.error("Error voting for wish: " + error);
    throw new Error(
      "Something went wrong while voting for the wish. Please inform a game master of the following timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};
