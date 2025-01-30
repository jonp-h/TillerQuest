"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export const getUserById = async (id: string) => {
  // unstable_noStore();

  // TODO: improve authentication by reworking creation page useSession
  // const session = await auth();
  // if (!session) {
  //   return null;
  // }

  try {
    const user = await db.user.findUnique({ where: { id } });

    return user;
  } catch {
    return null;
  }
};

export const getUserByUsername = async (username: string) => {
  // unstable_noStore();

  const session = await auth();
  if (
    !session ||
    (session?.user.role !== "USER" && session?.user.role !== "ADMIN")
  ) {
    throw new Error("Not authorized");
  }

  try {
    const user = await db.user.findUnique({ where: { username } });

    return user;
  } catch {
    return null;
  }
};

export const getLeaderboard = async () => {
  // unstable_noStore();

  const session = await auth();
  if (!session) {
    throw new Error("Not authorized");
  }

  try {
    const users = await db.user.findMany({
      where: { publicHighscore: true },
      orderBy: { xp: "desc" },
      take: 10,
    });

    return users;
  } catch {
    return null;
  }
};
