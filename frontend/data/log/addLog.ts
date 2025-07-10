"use server";

import { auth } from "@/auth";
import { ErrorMessage } from "@/lib/error";
import { PrismaTransaction } from "@/types/prismaTransaction";
import { headers } from "next/headers";

/**
 * Adds a log entry to the database. Required to be available in the edge runtime.
 *
 * @param db - The Prisma transaction instance used to interact with the database.
 * @param userId - The ID of the user associated with the log entry.
 * @param message - The log message to be stored.
 * @param global - Optional. Indicates if the log is global and stored in public logs (default: true).
 * @param debug - Optional. Indicates if the log is a debug log (default: false). Users can only add debug logs for themselves.
 * @returns The created log entry.
 * @throws {ErrorMessage} If the user is not authenticated or if they attempt to add a debug log for another user.
 * @throws {Error} If the log could not be added for other reasons.
 */
export const addLog = async (
  db: PrismaTransaction,
  userId: string,
  message: string,
  global: boolean = true, // default to global
  debug: boolean = false, // default to false
) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) {
      throw new ErrorMessage("Unauthorized access");
    }

    // Users can only add debug logs for themselves
    if (debug === true && session.user.id !== userId) {
      throw new ErrorMessage("Unauthorized access to add debug log");
    }

    const log = await db.log.create({
      data: {
        userId,
        global,
        message,
        debug,
      },
    });
    return log;
  } catch (error) {
    if (error instanceof ErrorMessage) {
      // not available in the edge runtime
      // logger.warn("Error adding log: " + error.message);
      console.warn("Error adding log: " + error.message);
      throw error;
    }

    // not available in the edge runtime
    // logger.error("Failed to add log: ", error);
    console.error("Failed to add log: ", error);
    throw new Error(
      "Failed to add log. Please inform a game master of the following timestamp" +
        Date.now().toLocaleString("no-NO"),
    );
  }
};
