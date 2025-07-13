"use server";

import { AuthorizationError, checkUserIdAndActiveAuth } from "@/lib/authUtils";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

export const getSystemMessages = async (userId: string) => {
  try {
    await checkUserIdAndActiveAuth(userId);

    const logs = await db.systemMessage.findMany({
      where: {
        readers: {
          none: {
            id: userId,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return logs;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access attempt to get system messages");
      throw error;
    }

    logger.error("Failed to get logs: ", error);
    throw new Error(
      "Failed to get system messages. Please inform a game master of the following timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

export const discardSystemMessage = async (
  userId: string,
  messageId: number,
) => {
  try {
    await checkUserIdAndActiveAuth(userId);

    await db.systemMessage.update({
      where: {
        id: messageId,
      },
      data: {
        readers: {
          connect: {
            id: userId,
          },
        },
      },
    });

    return "Message discarded!";
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access attempt to discard system message");
      throw error;
    }

    logger.error("Failed to discard message: ", error);
    throw new Error(
      "Failed to discard message. Please inform a game master of the following timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};
