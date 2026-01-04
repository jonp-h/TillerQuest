"use server";

import { db } from "@/lib/db";
import { addLog } from "../log/addLog";
import { auth } from "@/auth";
import { headers } from "next/headers";

export const checkNewUserSecret = async (id: string, secret: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  // FIXME: edge function restriction fixed? logger might be usable?
  if (!session) {
    console.warn(
      "Unauthorized access attempt to check new user secret without session",
    );
    return false;
  }

  if (session.user.id !== id) {
    console.warn(
      "Unauthorized access attempt to check new user secret for user ID: " + id,
    );
    return false;
  }

  // should be available to users with a valid session

  await addLog(
    db,
    id,
    "User " +
      session?.user.username +
      " (id: " +
      id +
      ") is checking new user secret",
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
