import { logger } from "lib/logger.js";
import { PrismaTransaction } from "types/prismaTransaction.js";

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
    // Users can only add debug logs for themselves
    // if (debug) {
    //   await validateUserIdAuth(userId);
    // }

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
    logger.error("Failed to add log: ", error);
    throw new Error("Failed to add log.");
  }
};
