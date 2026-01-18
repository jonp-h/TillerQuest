import { db } from "lib/db.js";
import { logger } from "lib/logger.js";

// get guild member count, excluding the current user
export const getGuildmemberCount = async (userId: string, guildId: number) => {
  try {
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
    logger.error("Error fetching guild member count: " + error);
    throw new Error(
      "Something went wrong while fetching guild member count. Please inform a game master of this timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

// get the classes taken by guild members in the selected guild, excluding the current user
export const guildClasses = async (userId: string, guildId: number) => {
  try {
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
    logger.error("Error fetching guild taken classes: " + error);
    throw new Error(
      "Something went wrong while fetching guild taken classes. Please inform a game master of this timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};
