"use server";

import { AuthorizationError, validateAdminAuth } from "@/lib/authUtils";
import { db } from "@/lib/db";
import { ErrorMessage } from "@/lib/error";
import { logger } from "@/lib/logger";
import { $Enums, UserRole } from "@prisma/client";

export const getAllActiveUsers = async () => {
  try {
    await validateAdminAuth();

    const users = await db.user.findMany({
      where: {
        role: {
          notIn: ["NEW", "ARCHIVED"],
        },
      },
      orderBy: [
        {
          schoolClass: "asc",
        },
        {
          name: "asc",
        },
        {
          lastname: "asc",
        },
      ],
    });
    return users;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized admin access attempt to get all users");
      throw error;
    }

    logger.error("Error fetching all users:", error);
    throw new Error(
      "Failed to fetch users. Error timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

export const getBasicUserDetails = async () => {
  try {
    await validateAdminAuth();

    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        lastname: true,
        schoolClass: true,
      },
      orderBy: [
        {
          schoolClass: "asc",
        },
        {
          name: "asc",
        },
        {
          lastname: "asc",
        },
      ],
    });
    return users;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn(
        "Unauthorized admin access attempt to get basic user details",
      );
      throw error;
    }

    logger.error("Error fetching basic user details:", error);
    throw new Error(
      "Failed to fetch basic user details. Error timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

export const adminGetUserInfo = async () => {
  try {
    await validateAdminAuth();

    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        lastname: true,
        username: true,
        special: true,
        role: true,
        schoolClass: true,
        access: true,
      },
      orderBy: [
        {
          schoolClass: "asc",
        },
        {
          name: "asc",
        },
        {
          lastname: "asc",
        },
      ],
    });
    return users;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized admin access attempt to get user info");
      throw error;
    }

    logger.error("Error fetching user info:", error);
    throw new Error(
      "Failed to fetch user info. Error timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

export const adminGetDungeonInfo = async () => {
  try {
    await validateAdminAuth();

    const dungeons = await db.guild.findMany({
      select: {
        name: true,
        enemies: {
          select: {
            id: true,
            health: true,
            enemy: {
              select: {
                name: true,
                icon: true,
              },
            },
          },
        },
      },
    });

    // const dungeons = await db.guildEnemy.findMany({
    //   select: {
    //     id: true,
    //     health: true,
    //     enemy: {
    //       select: {
    //         name: true,
    //         attack: true,
    //         icon: true,
    //         maxHealth: true,
    //       },
    //     },
    //     guild: {
    //       select: {
    //         name: true,
    //       },
    //     },
    //   },
    // });
    return dungeons;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized admin access attempt to get dungeon info");
      throw error;
    }

    logger.error("Error fetching dungeon info:", error);
    throw new Error(
      "Failed to fetch dungeon info. Error timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

export const getAllEnemyTypes = async () => {
  try {
    await validateAdminAuth();

    const enemyTypes = await db.enemy.findMany();

    return enemyTypes;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized admin access attempt to get enemy types");
      throw error;
    }

    logger.error("Error fetching enemy types:", error);
    throw new Error(
      "Failed to fetch enemy types. Error timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

export const getSpecialStatuses = async () => {
  try {
    await validateAdminAuth();

    const specialReqs = await db.shopItem.findMany({
      where: {
        specialReq: {
          not: null,
        },
      },
      select: {
        specialReq: true,
      },
    });
    return specialReqs;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized admin access attempt to get special statuses");
      throw error;
    }

    logger.error("Error fetching special statuses:", error);
    throw new Error(
      "Failed to fetch special statuses. Error timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

export const adminUpdateUser = async (
  userId: string,
  special: string[],
  access?: string[],
  name?: string | null,
  username?: string | null,
  lastname?: string | null,
) => {
  try {
    await validateAdminAuth();

    // Check if username already exists
    if (username) {
      const existingUser = await db.user.findFirst({
        where: {
          username,
        },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new ErrorMessage("Username already exists.");
      }
    }
    // If access is provided and contains an empty string, treat as removing all access
    if (access && access.length === 1 && access[0] === "") {
      access = [];
    }

    const user = await db.user.update({
      where: {
        id: userId,
      },
      data: {
        name,
        username,
        lastname,
        special,
        access: access as $Enums.Access[],
      },
    });
    return user;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized admin access attempt to update user");
      throw error;
    }

    if (error instanceof ErrorMessage) {
      throw error;
    }
    logger.error("Error in admin action for updating user:", error);
    throw new Error(
      "Failed to update user. Error timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

export const updateRole = async (userId: string, role: UserRole) => {
  try {
    await validateAdminAuth();

    const user = await db.user.update({
      where: {
        id: userId,
      },
      data: {
        role,
      },
    });
    return user;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized admin access attempt to update user role");
      throw error;
    }

    logger.error("Error in admin action for updating user role:", error);
    throw new Error(
      "Failed to update user role. Error timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};
