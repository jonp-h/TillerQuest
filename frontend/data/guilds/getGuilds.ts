"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export const getGuilds = async () => {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Not authorized");
  }

  const guilds = await db.guild.findMany({
    select: {
      name: true,
      schoolClass: true,
      members: {
        select: {
          id: true,
          name: true,
          lastname: true,
          schoolClass: true,
        },
      },
    },
    orderBy: [{ schoolClass: "asc" }, { name: "asc" }],
  });

  return guilds;
};

// get guild member count of all guilds, excluding the current user in the count
export const getGuildsAndMemberCount = async (userId: string) => {
  // Should be open to new users / users with a valid session
  const session = await auth();
  if (session?.user.id !== userId) {
    throw new Error("Not authorized");
  }

  const guilds = await db.guild.findMany({
    include: {
      _count: {
        select: {
          members: true,
        },
      },
      members: {
        where: {
          id: {
            not: userId,
          },
        },
      },
    },
  });

  const guildsWithMemberCount = guilds.map((guild) => ({
    name: guild.name,
    memberCount: guild.members.length,
  }));

  return guildsWithMemberCount;
};

// get guild member count, excluding the current user
export const getGuildmemberCount = async (
  userId: string,
  guildName: string,
) => {
  // FIXME: required to be open to new users?
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
                not: userId,
              },
            },
          },
        },
      },
    },
  });

  return guild?._count.members || 0;
};
