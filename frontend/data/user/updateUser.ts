"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

// used on account creation page
// TODO: consider implementation of typesafety from auth.ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateUser = async (id: string, data: any) => {
  const session = await auth();
  if (session?.user?.id !== id || session?.user?.role !== "NEW") {
    throw new Error("Not authorized");
  }

  try {
    await db.user.update({
      where: { id },
      data: data,
    });
    return true;
  } catch {
    return false;
  }
};
