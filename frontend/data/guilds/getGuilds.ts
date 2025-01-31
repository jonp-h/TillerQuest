"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export const getGuildNames = async () => {
  // Should be able to new users / users with a valid session
  // const session = await auth();
  // if (!session) {
  //   throw new Error("Not authorized");
  // }

  const guilds = await db.guild.findMany({
    select: {
      name: true,
    },
  });
  return guilds;
};
