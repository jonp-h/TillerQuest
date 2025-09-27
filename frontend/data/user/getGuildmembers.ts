"use server";

import { AuthorizationError, validateActiveUserAuth } from "@/lib/authUtils";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

export const getGuildmembersByGuildname = async (guildName: string) => {
  try {
    await validateActiveUserAuth();

    const members = await db.user.findMany({
      where: { guildName },
      select: {
        id: true,
        title: true,
        titleRarity: true,
        username: true,
        image: true,
        hp: true,
        hpMax: true,
        mana: true,
        manaMax: true,
        class: true,
        guild: {
          select: {
            guildLeader: true,
          },
        },
      },
      orderBy: {
        username: "desc",
      },
    });
    return members;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access to guild members: " + error);
      throw error;
    }

    logger.error("Error fetching guild members: " + error);
    throw new Error(
      "Something went wrong while fetching guild members. Please inform a game master of the following timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};
