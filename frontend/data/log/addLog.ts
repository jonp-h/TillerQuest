"use server";

import { auth } from "@/auth";
import { logger } from "@/lib/logger";
import { PrismaTransaction } from "@/types/prismaTransaction";

export const addLog = async (
  db: PrismaTransaction,
  userId: string,
  message: string,
) => {
  const session = await auth();
  if (!session || session?.user.role === "NEW") {
    throw new Error("Not authorized");
  }

  try {
    const log = await db.log.create({
      data: {
        userId,
        message,
      },
    });
    return log;
  } catch (error) {
    logger.error("Failed to add log: ", error);
    return null;
  }
};
