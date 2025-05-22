"use server";
import { auth } from "@/auth";
import { db as prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export const getDungeonAbilities = async (userId: string) => {
  const session = await auth();
  if (
    !session ||
    (session?.user.role !== "USER" && session?.user.role !== "ADMIN")
  ) {
    return null;
  }
  try {
    const abilities = await prisma.ability.findMany({
      where: { users: { some: { userId } }, isDungeon: true },
    });
    return abilities;
  } catch (error) {
    logger.error("Error fetching abilities: " + error);
  }
};
