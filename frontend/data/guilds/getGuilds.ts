"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

// get guild member count of all guilds, excluding the current user in the count
export const getGuilds = async (id: string) => {
  // Should be open to new users / users with a valid session
  const session = await auth();
  if (session?.user.id !== id) {
    throw new Error("Not authorized");
  }

  const guilds = await db.guild.findMany({
    select: {
      name: true,
      members: {
        where: {
          id: {
            not: id,
          },
        },
      },
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

// get guild member count, excluding the current user
export const getGuildmemberCount = async (id: string, guildName: string) => {
  const guild = await db.guild.findFirst({
    where: {
      name: guildName,
    },
    include: {
      _count: {
        select: {
          members: {
            where: {
              id: {
                not: id,
              },
            },
          },
        },
      },
    },
  });

  return guild?._count.members || 0;
};
