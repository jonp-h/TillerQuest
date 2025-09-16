"use server";

import {
  AuthorizationError,
  validateActiveUserAuth,
  validateAdminAuth,
  validateUserIdAuth,
} from "@/lib/authUtils";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { SchoolClass } from "@prisma/client";

export const getGuilds = async (archived: boolean) => {
  try {
    await validateAdminAuth();

    const guilds = await db.guild.findMany({
      where: {
        archived,
      },
      select: {
        name: true,
        schoolClass: true,
        archived: true,
        guildLeader: true,
        nextGuildLeader: true,
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

export const getGuildByUserId = async (userId: string) => {
  try {
    await validateUserIdAuth(userId);

    const guild = await db.guild.findFirst({
      where: {
        members: {
          some: {
            id: userId,
          },
        },
      },
      select: {
        name: true,
        schoolClass: true,
        guildLeader: true,
        nextGuildLeader: true,
        level: true,
        icon: true,
        nextBattleVotes: true,
        enemies: {
          select: {
            name: true,
            health: true,
          },
        },
        members: {
          select: {
            id: true,
            image: true,
            title: true,
            titleRarity: true,
            username: true,
            hp: true,
            hpMax: true,
            mana: true,
            manaMax: true,
          },
        },
      },
    });

    return guild;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access attempt to get guild by user ID");
      throw error;
    }
    logger.error("Error fetching guild by user ID: " + error);
    throw new Error(
      "Something went wrong while fetching guild by user ID. Please inform a game master of this timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

// get guild member count of all guilds, excluding the current user in the count and only returning guilds that are not archived
export const getGuildsAndMemberCountBySchoolClass = async (
  userId: string,
  schoolClass: string,
) => {
  try {
    // Should be open to new users / users with a valid session
    await validateUserIdAuth(userId);

    const guilds = await db.guild.findMany({
      where: {
        schoolClass: {
          equals: schoolClass as SchoolClass,
        },
        archived: false,
      },
      select: {
        id: true,
        name: true,
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
        id: "asc",
      },
    });

    const guildsWithMemberCount = guilds.map((guild) => ({
      id: guild.id,
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
export const getGuildmemberCount = async (userId: string, guildId: number) => {
  try {
    await validateUserIdAuth(userId);

    const guild = await db.guild.findFirst({
      where: {
        id: guildId,
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
        "Unauthorized access attempt to get guild member count for guildId: " +
          guildId,
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
export const getGuildClasses = async (userId: string, guildId: number) => {
  try {
    await validateUserIdAuth(userId);

    const guild = await db.guild.findFirst({
      where: {
        id: guildId,
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
        "Unauthorized access attempt to get guild taken classes for guildId: " +
          guildId,
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

export const getGuildLeaderboard = async () => {
  try {
    await validateActiveUserAuth();

    const guild = await db.guild.findMany({
      where: {
        archived: false,
        members: {
          some: {
            id: {
              not: "",
            },
          },
        },
      },
      select: {
        name: true,
        schoolClass: true,
        guildLeader: true,
        level: true,
        icon: true,
        members: {
          select: {
            id: true,
            username: true,
            xp: true,
          },
        },
      },
      orderBy: [{ level: "desc" }, { name: "asc" }],
    });

    return guild;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access attempt to get guild by user ID");
      throw error;
    }
    logger.error("Error fetching guild by user ID: " + error);
    throw new Error(
      "Something went wrong while fetching guild by user ID. Please inform a game master of this timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};
