"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

export const getSystemMessages = async (userId: string) => {
  const session = await auth();
  if (!session || session?.user.role === "NEW") {
    throw new Error("Not authorized");
  }

  try {
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
    logger.error("Failed to get logs: ", error);
    return null;
  }
};

export const discardSystemMessage = async (
  userId: string,
  messageId: number,
) => {
  const session = await auth();
  if (!session || session?.user.role === "NEW" || session.user.id !== userId) {
    throw new Error("Not authorized");
  }

  try {
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
    logger.error("Failed to discard message: ", error);
    return "Failed to discard message";
  }
};
