"use server";

import {
  AuthorizationError,
  checkActiveUserAuth,
  checkAdminAuth,
} from "@/lib/authUtils";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

export const getAllLogs = async () => {
  try {
    await checkAdminAuth();

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
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized admin access attempt to get all logs");
      throw error;
    }

    logger.error("Failed to get logs: ", error);
    throw new Error(
      "Failed to get logs. Error timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

export const getLogsByUserId = async (userId: string) => {
  try {
    await checkActiveUserAuth();

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
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access attempt to get logs by user ID");
      throw error;
    }

    logger.error("Failed to get logs: ", error);
    throw new Error(
      "Failed to get logs. Please inform a game master of the following timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};
