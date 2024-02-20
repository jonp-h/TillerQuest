import { db } from "@/lib/db";
import { unstable_cache, unstable_noStore } from "next/cache";

export const getUserById = async (id: string) => {
  unstable_noStore();
  try {
    const user = await db.user.findUnique({ where: { id } });

    return user;
  } catch {
    return null;
  }
};

export const getUserByUsername = async (username: string) => {
  unstable_noStore();
  try {
    const user = await db.user.findUnique({ where: { username } });

    return user;
  } catch {
    return null;
  }
};

export const updateUser = async (id: string, data: any) => {
  try {
    await db.user.update({
      where: { id },
      data: data,
    });
    return true;
  } catch {
    return false;
  }
};

// Prisma require "include" to include relations
export const getUserWithAbilitiesByUsername = async (username: string) => {
  try {
    const user = await db.user.findUnique({
      where: { username },
      include: {
        abilities: true,
      },
    });

    return user;
  } catch {
    return null;
  }
};
// get all the users that are in the same clan as the current user
// TODO: could add clanname to token and use that instead of fetching the clanId
export const getUsersByCurrentUserClan = async (clanName: string) => {
  // const clanId = await getUserClan(id);
  // const clanId = 1; // TODO: remove this hardcoding
  try {
    const users = await db.user.findMany({
      where: { clanName },
    });
    return users;
  } catch {
    return null;
  }
};
