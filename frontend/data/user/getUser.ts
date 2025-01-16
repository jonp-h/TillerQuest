"use server";

import { db } from "@/lib/db";

export const getUserById = async (id: string) => {
  // unstable_noStore();
  try {
    const user = await db.user.findUnique({ where: { id } });

    return user;
  } catch {
    return null;
  }
};

export const getUserByUsername = async (username: string) => {
  // unstable_noStore();
  try {
    const user = await db.user.findUnique({ where: { username } });

    return user;
  } catch {
    return null;
  }
};
