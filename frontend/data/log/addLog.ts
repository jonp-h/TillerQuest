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
  if (!session || session?.user.id !== userId) {
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
    return null;
  }
};
