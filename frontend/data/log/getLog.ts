"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

export const getAllLogs = async () => {
  const session = await auth();
  if (!session || session?.user.role !== "ADMIN") {
    throw new Error("Not authorized");
  }

  try {
    const logs = await db.log.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        global: true,
        message: {
          not: {
            startsWith: "COSMIC",
          },
        },
      },
    });

    return logs;
  } catch (error) {
    logger.error("Failed to get logs: ", error);
    return null;
  }
};

export const getLogsByUserId = async (userId: string) => {
  const session = await auth();
  if (!session || session?.user.role === "NEW") {
    throw new Error("Not authorized");
  }

  try {
    const logs = await db.log.findMany({
      where: {
        userId,
        debug: false, // Exclude debug logs
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
