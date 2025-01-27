"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export const getCosmic = async () => {
  const session = await auth();
  if (
    !session ||
    (session?.user.role !== "USER" && session?.user.role !== "ADMIN")
  ) {
    throw new Error("Not authorized");
  }

  const cosmic = await db.cosmicEvent.findFirst({
    where: {
      selected: true,
    },
  });
  return cosmic;
};
