import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { PrismaTransaction } from "../../types/prismaTransaction.js";

/**
 * Get guild members by guild name
 * Can be used in transactions or standalone
 */
export const getGuildmembersByGuildname = async (
  guildName: string,
  tx: PrismaTransaction | typeof db = db,
) => {
  try {
    const members = await tx.user.findMany({
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
    logger.error("Error fetching guild members by guild name: " + error);
    throw new Error(
      "Something went wrong while fetching guild members. Please inform a game master of the following timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};
