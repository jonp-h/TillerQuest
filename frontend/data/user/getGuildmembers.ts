"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

// get all the users that are in the same guild as the current user
export const getMembersByCurrentUserGuild = async (guildName: string) => {
  const session = await auth();
  if (
    !session ||
    (session?.user.role !== "USER" && session?.user.role !== "ADMIN")
  ) {
    throw new Error("Not authorized");
  }

  try {
    const members = await db.user.findMany({
      where: { guildName },
      select: {
        id: true,
        username: true,
        image: true,
        hp: true,
        hpMax: true,
        mana: true,
        manaMax: true,
      },
    });
    return members;
  } catch {
    return null;
  }
};
