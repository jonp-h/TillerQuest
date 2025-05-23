"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export const getUserById = async (id: string) => {
  // unstable_noStore();

  const session = await auth();
  if (session?.user.role === "NEW" || !session) {
    return null;
  }

  try {
    const user = await db.user.findUnique({
      where: { id },
    });

    return user;
  } catch {
    return null;
  }
};

// Only used by auth.ts
export const getUserAuthById = async (id: string) => {
  // unstable_noStore();

  // TODO: improve authentication by reworking creation page useSession
  // const session = await auth();
  // if (session?.user.role === "NEW" || !session) {
  //   return null;
  // }

  try {
    const user = await db.user.findUnique({
      where: { id },
      select: {
        username: true,
        class: true,
        role: true,
      },
    });

    return user;
  } catch {
    return null;
  }
};

export const getUserProfileByUsername = async (username: string) => {
  // unstable_noStore();

  const session = await auth();
  if (!session || session?.user.role === "NEW") {
    throw new Error("Not authorized");
  }

  try {
    const user = await db.user.findUnique({
      where: { username },
      select: {
        id: true,
        title: true,
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
        inventory: {
          where: {
            specialReq: { not: null },
          },
          select: {
            name: true,
            specialReq: true,
            description: true,
          },
        },
      },
    });

    return user;
  } catch {
    return null;
  }
};

export const getUserInventory = async (id: string) => {
  // unstable_noStore();

  const session = await auth();
  if (session?.user.id !== id) {
    throw new Error("Not authorized");
  }

  try {
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
  } catch {
    return null;
  }
};

export const getVg1Leaderboard = async () => {
  // unstable_noStore();

  const session = await auth();
  if (!session || session?.user.role === "NEW") {
    throw new Error("Not authorized");
  }

  try {
    const users = await db.user.findMany({
      where: {
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
  } catch {
    return null;
  }
};
export const getVg2Leaderboard = async () => {
  // unstable_noStore();

  const session = await auth();
  if (!session || session?.user.role === "NEW") {
    throw new Error("Not authorized");
  }

  try {
    const users = await db.user.findMany({
      where: {
        publicHighscore: true,
        schoolClass: {
          in: ["Class_2IT1", "Class_2IT2", "Class_2IT3", "Class_2MP1"],
        },
      },
      orderBy: { xp: "desc" },
      take: 10,
    });

    return users;
  } catch {
    return null;
  }
};
