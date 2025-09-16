"use server";

import { AuthorizationError, validateAdminAuth } from "@/lib/authUtils";
import { db } from "@/lib/db";
import { ErrorMessage } from "@/lib/error";
import { logger } from "@/lib/logger";
import { ServerActionResult } from "@/types/serverActionResult";
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
            name: true,
            icon: true,
            attack: true,
            xp: true,
            gold: true,
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

export const adminDeleteGuildEnemies = async (
  guildName: string,
): Promise<ServerActionResult> => {
  try {
    await validateAdminAuth();

    await db.guildEnemy.deleteMany({
      where: {
        guild: {
          name: guildName,
        },
      },
    });

    return {
      success: true,
      data: "Successfully deleted all enemies from guild: " + guildName,
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized admin access attempt to get dungeon info");
      return {
        success: false,
        error: error.message,
      };
    }

    logger.error("Error fetching dungeon info:", error);
    return {
      success: false,
      error:
        "Failed to fetch dungeon info. Error timestamp: " +
        Date.now().toLocaleString("no-NO"),
    };
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
): Promise<ServerActionResult> => {
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

    await db.user.update({
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
    return {
      success: true,
      data: "User information updated successfully.",
    };
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

export const updateRole = async (
  userId: string,
  role: UserRole,
): Promise<ServerActionResult> => {
  try {
    await validateAdminAuth();

    await db.user.update({
      where: {
        id: userId,
      },
      data: {
        role,
      },
    });
    return {
      success: true,
      data: "User role updated successfully.",
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized admin access attempt to update user role");
      return {
        success: false,
        error: error.message,
      };
    }

    logger.error("Error in admin action for updating user role:", error);
    return {
      success: false,
      error:
        "Failed to update user role. Error timestamp: " +
        Date.now().toLocaleString("no-NO"),
    };
  }
};

export const adminResetSingleUser = async (
  userId: string,
): Promise<ServerActionResult> => {
  try {
    await validateAdminAuth();

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        mana: true,
        abilities: {
          select: {
            id: true,
            ability: {
              select: {
                gemstoneCost: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new ErrorMessage(`User not found.`);
    }

    // ------- The following can be made into a function ------

    let totalGemstoneCost = 0;
    for (const ability of user.abilities) {
      totalGemstoneCost += ability.ability.gemstoneCost;
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        role: "NEW",
        hp: 40,
        hpMax: 40,
        mana: Math.min(user.mana, 40),
        manaMax: 40,
        gemstones: {
          increment: totalGemstoneCost,
        },
        class: null,
        guildName: null,
        games: {
          deleteMany: {
            userId: user.id,
          },
        },
        logs: {
          create: {
            global: false,
            message: `RESET: Your account has been reset. You have been refunded ${totalGemstoneCost} gemstones.`,
          },
        },
        title: "Newborn",
        titleRarity: "Common",
        sessions: {
          deleteMany: {
            userId: user.id,
          },
        },
        passives: {
          deleteMany: {
            userId: user.id,
          },
        },
        access: {
          set: [],
        },
        abilities: {
          deleteMany: {
            userId: user.id,
          },
        },
      },
    });

    // ------------------------------

    return {
      success: true,
      data: "User successfully reset",
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized admin access attempt to reset single user");
      return {
        success: false,
        error: error.message,
      };
    }

    if (error instanceof ErrorMessage) {
      return {
        success: false,
        error: error.message,
      };
    }
    logger.error("Error in admin action for resetting single user:", error);
    return {
      success: false,
      error:
        "Failed to reset single user. Error timestamp: " +
        Date.now().toLocaleString("no-NO"),
    };
  }
};
