"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export const getGuilds = async () => {
  // Should be open to new users / users with a valid session
  // const session = await auth();
  // if (!session) {
  //   throw new Error("Not authorized");
  // }

  const guilds = await db.guild.findMany({
    select: {
      name: true,
      members: true,
    },
  });

  const guildsWithMemberCount = await Promise.all(
    guilds.map(async (guild) => {
      const guildWithCount = await db.guild.findFirst({
        where: {
          name: guild.name,
        },
        include: {
          _count: {
            select: {
              members: true,
            },
          },
        },
      });

      return {
        name: guild.name,
        memberCount: guildWithCount?._count.members || 0,
      };
    }),
  );

  return guildsWithMemberCount;
};
