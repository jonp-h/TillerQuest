"use server";

import { auth } from "@/auth";

export const checkNewUserSecret = async (secret: string) => {
  // should be available to users with a valid session
  const session = await auth();
  if (!session) {
    throw new Error("Not authorized");
  }
  return secret == process.env.NEW_USER_SECRET;
};
