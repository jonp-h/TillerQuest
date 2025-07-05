"use server";

import {
  AuthorizationError,
  checkAdminAuth,
  checkUserIdAuth,
} from "@/lib/authUtils";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

export const getGuilds = async () => {
  try {
    await checkAdminAuth();

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
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized admin access attempt to get guilds");
      throw error;
    }
    logger.error("Error fetching guilds: " + error);
    throw new Error(
      "Something went wrong while fetching guilds. Please inform a game master of this timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

// get guild member count of all guilds, excluding the current user in the count
export const getGuildsAndMemberCount = async (userId: string) => {
  try {
    // Should be open to new users / users with a valid session
    await checkUserIdAuth(userId);

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
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access attempt to get guilds and member count");
      throw error;
    }
    logger.error("Error fetching guilds and member count: " + error);
    throw new Error(
      "Something went wrong while fetching guilds and member count. Please inform a game master of this timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};
