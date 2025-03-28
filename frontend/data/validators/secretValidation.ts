"use server";

import { auth } from "@/auth";
import { logger } from "@/lib/logger";

export const checkNewUserSecret = async (id: string, secret: string) => {
  // should be available to users with a valid session
  const session = await auth();
  if (!session || session?.user.role !== "NEW" || session?.user.id !== id) {
    throw new Error("Not authorized");
  }
  logger.info(
    "Checking secret for user: " + session.user.username + " (id: " + id + ")",
  );
  return secret == process.env.NEW_USER_SECRET;
};
