"use server";

import {
  AuthorizationError,
  checkAdminAuth,
  checkUserIdAuth,
} from "@/lib/authUtils";
import { db } from "@/lib/db";
import { ErrorMessage } from "@/lib/error";
import { logger } from "@/lib/logger";
import { SchoolClass } from "@prisma/client";

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
export const getGuildsAndMemberCountBySchoolClass = async (
  userId: string,
  schoolClass: string,
) => {
  try {
    // Should be open to new users / users with a valid session
    await checkUserIdAuth(userId);

    const guilds = await db.guild.findMany({
      where: {
        schoolClass: {
          equals: schoolClass as SchoolClass,
        },
      },
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
      orderBy: {
        name: "asc",
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

// get guild member count, excluding the current user
export const getGuildmemberCount = async (
  userId: string,
  guildName: string,
) => {
  try {
    await checkUserIdAuth(userId);

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
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn(
        "Unauthorized access attempt to get guild member count for " +
          guildName,
      );
      throw error;
    }

    if (error instanceof ErrorMessage) {
      logger.warn(
        "Unauthorized access attempt to get guild member count for " +
          guildName,
      );
      throw error;
    }
    logger.error("Error fetching guild member count: " + error);
    throw new Error(
      "Something went wrong while fetching guild member count. Please inform a game master of this timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

// get guild member count, excluding the current user
export const getGuildClasses = async (userId: string, guildName: string) => {
  try {
    await checkUserIdAuth(userId);

    const guild = await db.guild.findFirst({
      where: {
        name: guildName,
      },
      select: {
        members: {
          select: {
            class: true,
          },
          where: {
            id: {
              not: userId,
            },
          },
        },
      },
    });

    return guild?.members || [];
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn(
        "Unauthorized access attempt to get guild taken classes for " +
          guildName,
      );
      throw error;
    }

    if (error instanceof ErrorMessage) {
      logger.warn(
        "Unauthorized access attempt to get guild taken classes for " +
          guildName,
      );
      throw error;
    }
    logger.error("Error fetching guild taken classes: " + error);
    throw new Error(
      "Something went wrong while fetching guild taken classes. Please inform a game master of this timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};
