"use server";

import { auth } from "@/auth";
import { db as prisma } from "@/lib/db";

export const getRandomEnemy = async () => {
  const session = await auth();
  if (
    !session ||
    (session?.user.role !== "USER" && session?.user.role !== "ADMIN")
  ) {
    throw new Error("Not authorized");
  }

  const totalEnemies = await prisma.enemy.count();
  const randomOffset = Math.floor(Math.random() * totalEnemies);

  const enemies = await prisma.enemy.findFirst({
    select: {
      name: true,
      icon: true,
      attack: true,
      health: true,
      xp: true,
      gold: true,
    },
    orderBy: {
      id: "asc",
    },
    skip: randomOffset,
  });
  console.log("enemies", enemies);
  return enemies;
};
