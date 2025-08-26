"use server";

import { auth } from "@/auth";
import {
  AuthorizationError,
  validateActiveUserAuth,
  validateAdminAuth,
  validateUserIdAndActiveUserAuth,
  validateUserIdAuth,
  validateUsernameAndActiveUserAuth,
} from "@/lib/authUtils";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { headers } from "next/headers";

export const getUserById = async (id: string) => {
  // unstable_noStore();

  try {
    await validateActiveUserAuth();

    const user = await db.user.findUnique({
      where: { id },
    });

    return user;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access attempt to user with ID. " + error);
      throw error;
    }

    logger.error("Error fetching user by ID: " + error);
    throw new Error(
      "Something went wrong while fetching user by ID. Please inform a game master of the following timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

export const getGameUserById = async (id: string) => {
  // unstable_noStore();

  try {
    await validateActiveUserAuth();

    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        arenaTokens: true,
        access: true,
        gold: true,
      },
    });

    return user;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn(
        "Unauthorized access attempt to get game user with ID. " + error,
      );
      throw error;
    }

    logger.error("Error fetching game user by ID: " + error);
    throw new Error(
      "Something went wrong while fetching game user by ID. Please inform a game master of the following timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

export const getCreateUserById = async (id: string) => {
  // unstable_noStore();

  try {
    await validateUserIdAuth(id);

    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        username: true,
        lastname: true,
        publicHighscore: true,
      },
    });

    return user;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn(
        "Unauthorized access attempt to get create user with ID. " + error,
      );
      throw error;
    }

    logger.error("Error fetching create user by ID: " + error);
    throw new Error(
      "Something went wrong while fetching create user by ID. Please inform a game master of the following timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

export const getUserProfileByUsername = async (username: string) => {
  // unstable_noStore();

  try {
    await validateActiveUserAuth();

    const user = await db.user.findUnique({
      where: { username },
      select: {
        id: true,
        title: true,
        titleRarity: true,
        name: true,
        username: true,
        lastname: true,
        class: true,
        gold: true,
        hp: true,
        hpMax: true,
        mana: true,
        manaMax: true,
        xp: true,
        gemstones: true,
        arenaTokens: true,
        level: true,
        image: true,
        guildName: true,
        lastMana: true,
        publicHighscore: true,
        archiveConsent: true,
        guild: {
          select: {
            guildLeader: true,
            icon: true,
          },
        },
        inventory: {
          where: {
            type: "Badge",
          },
          select: {
            name: true,
            icon: true,
            description: true,
            rarity: true,
          },
        },
      },
    });

    return user;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access attempt to user profile. " + error);
      throw error;
    }

    logger.error("Error fetching user profile by username: " + error);
    throw new Error(
      "Something went wrong while fetching user profile by username. Please inform a game master of the following timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

export const getUserSettingsByUsername = async (username: string) => {
  // unstable_noStore();

  try {
    await validateUsernameAndActiveUserAuth(username);

    const user = await db.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        publicHighscore: true,
        archiveConsent: true,
      },
    });

    return user;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access attempt to get user settings. " + error);
      throw error;
    }

    logger.error("Error fetching user settings by username: " + error);
    throw new Error(
      "Something went wrong while fetching user settings. Please inform a game master of the following timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

export const getDeadUsers = async () => {
  try {
    await validateActiveUserAuth();

    const deadUsers = await db.user.findMany({
      where: {
        hp: {
          equals: 0,
        },
      },
    });
    return deadUsers;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access attempt to all dead users. " + error);
      throw error;
    }

    logger.error("Error fetching all dead users: " + error);
    throw new Error(
      "Something went wrong while fetching all dead users. Please inform a game master of the following timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

// Only used by game masters
export const getDeadUserCount = async () => {
  try {
    await validateAdminAuth();
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "ADMIN") {
      throw new AuthorizationError(
        "Unauthorized access to dead user count.",
        "Unauthorized",
        "You do not have access",
      );
    }

    const deadUserCount = await db.user.count({
      where: {
        hp: {
          equals: 0,
        },
      },
    });
    return deadUserCount;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn(
        "Unauthorized access attempt to count all dead users. " + error,
      );
      throw error;
    }

    logger.error("Error counting all dead users: " + error);
    throw new Error(
      "Something went wrong while counting all dead users. Error timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

export const getUserInventory = async (id: string) => {
  // unstable_noStore();

  try {
    await validateUserIdAndActiveUserAuth(id);

    const inventory = await db.user.findFirst({
      where: { id },
      select: {
        id: true,
        title: true,
        class: true,
        gold: true,
        level: true,
        inventory: true,
        special: true,
      },
    });

    return inventory;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access attempt to user inventory. " + error);
      throw error;
    }

    logger.error("Error fetching user inventory: " + error);
    throw new Error(
      "Something went wrong while fetching user inventory. Please inform a game master of the following timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

export const getVg1Leaderboard = async () => {
  // unstable_noStore();

  try {
    await validateActiveUserAuth();

    const users = await db.user.findMany({
      where: {
        role: "USER",
        publicHighscore: true,
        schoolClass: {
          in: ["Class_1IM1", "Class_1IM2", "Class_1IM3", "Class_1IM4"],
        },
      },
      orderBy: { xp: "desc" },
      take: 10,
      select: {
        xp: true,
        title: true,
        titleRarity: true,
        name: true,
        username: true,
        lastname: true,
        image: true,
        level: true,
        class: true,
        guildName: true,
        schoolClass: true,
      },
    });

    return users;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access attempt to VG1 leaderboard. " + error);
      throw error;
    }

    logger.error("Error fetching VG1 leaderboard: " + error);
    throw new Error(
      "Something went wrong while fetching VG1 leaderboard. Please inform a game master of the following timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};
export const getVg2Leaderboard = async () => {
  // unstable_noStore();

  try {
    await validateActiveUserAuth();

    const users = await db.user.findMany({
      where: {
        role: "USER",
        publicHighscore: true,
        schoolClass: {
          in: ["Class_2IT1", "Class_2IT2", "Class_2IT3", "Class_2MP1"],
        },
      },
      orderBy: { xp: "desc" },
      take: 10,
      select: {
        xp: true,
        title: true,
        titleRarity: true,
        name: true,
        username: true,
        lastname: true,
        image: true,
        level: true,
        class: true,
        guildName: true,
        schoolClass: true,
      },
    });

    return users;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access attempt to VG2 leaderboard. " + error);
      throw error;
    }

    logger.error("Error fetching VG2 leaderboard: " + error);
    throw new Error(
      "Something went wrong while fetching VG2 leaderboard. Please inform a game master of the following timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

export const getValhallaUsers = async () => {
  try {
    await validateActiveUserAuth();

    const users = await db.user.findMany({
      where: {
        publicHighscore: true,
        archiveConsent: true,
        // inventory: {
        //   some: {
        //     name: {
        //       in: ["Demi-god"],
        //     },
        //   },
        // },
        xp: {
          gte: 50000,
        },
      },
      orderBy: { xp: "desc" },
      select: {
        xp: true,
        title: true,
        titleRarity: true,
        name: true,
        username: true,
        lastname: true,
        image: true,
        level: true,
        class: true,
        guildName: true,
        schoolClass: true,
      },
    });

    return users;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access attempt to Valhalla users. " + error);
      throw error;
    }

    logger.error("Error fetching Valhalla users: " + error);
    throw new Error(
      "Something went wrong while fetching Valhalla users. Please inform a game master of the following timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

export const getTotalUserCount = async () => {
  try {
    await validateAdminAuth();
    const totalUserCount = await db.user.count();
    return totalUserCount;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access attempt to total user count. " + error);
      throw error;
    }
    logger.error("Error fetching total user count: " + error);
    throw new Error(
      "Something went wrong while fetching total user count. Please inform a game master of the following timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};
