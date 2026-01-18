import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";

/**
 * Get all active users by vg1
 */
export const getVg1Leaderboard = async () => {
  try {
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
    logger.error("Error fetching VG1 leaderboard: " + error);
    throw new Error(
      "Something went wrong while fetching VG1 leaderboard. Please inform a game master of the following timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

/**
 * Get all active users by vg2
 */
export const getVg2Leaderboard = async () => {
  try {
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
    logger.error("Error fetching VG2 leaderboard: " + error);
    throw new Error(
      "Something went wrong while fetching VG2 leaderboard. Please inform a game master of the following timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};
