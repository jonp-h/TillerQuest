"use server";
import { AuthorizationError, validateActiveUserAuth } from "@/lib/authUtils";
import { db as prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export const getDungeonAbilities = async (userId: string) => {
  try {
    await validateActiveUserAuth();
    const abilities = await prisma.ability.findMany({
      where: { users: { some: { userId } }, isDungeon: true },
      orderBy: { name: "asc" },
    });
    return abilities;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access attempt to get dungeon abilities");
      throw error;
    }

    logger.error("Error fetching abilities: " + error);
    throw new Error(
      "Error fetching dungeon abilities. Please inform a game master of this timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};
