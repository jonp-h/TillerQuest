"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { addLog } from "../log/addLog";

export const checkNewUserSecret = async (id: string, secret: string) => {
  // should be available to users with a valid session
  const session = await auth();
  if (!session || session?.user.role !== "NEW" || session?.user.id !== id) {
    throw new Error("Not authorized");
  }

  addLog(
    db,
    id,
    "User " +
      session.user.username +
      " (id: " +
      id +
      ") is checking new user secret: " +
      secret,
    false,
    true, // debug log. excluded from global logs
  );

  const existingSecret = await db.applicationSettings.findFirst({
    where: {
      key: "NEW_USER_SECRET",
      value: secret,
    },
  });

  return !!existingSecret;
};
