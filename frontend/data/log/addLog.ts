"use server";

import { auth } from "@/auth";
import { PrismaTransaction } from "@/types/prismaTransaction";

export const addLog = async (
  db: PrismaTransaction,
  userId: string,
  message: string,
  global: boolean = true, // default to global
  debug: boolean = false, // default to false
) => {
  const session = await auth();
  if (!session) {
    throw new Error("Not authorized");
  }

  // Users can only add debug logs for themselves
  if (debug === true && session.user.id !== userId) {
    throw new Error("Not authorized");
  }

  try {
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
    // not available in the edge runtime
    // logger.error("Failed to add log: ", error);
    console.error("Failed to add log: ", error);
    throw new Error(
      "Please inform a game master of the following timestamp" +
        Date.now().toLocaleString("no-NO"),
    );
  }
};
