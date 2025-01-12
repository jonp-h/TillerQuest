"use server";

import { db } from "@/lib/db";

export const getGuildNames = async () => {
  const guilds = await db.guild.findMany({
    select: {
      name: true,
    },
  });
  return guilds;
};
