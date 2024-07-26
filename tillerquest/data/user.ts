"use server";
import { db } from "@/lib/db";

export const getUserById = async (id: string) => {
  // unstable_noStore();
  try {
    const user = await db.user.findUnique({ where: { id } });

    return user;
  } catch {
    return null;
  }
};

export const getUserByUsername = async (username: string) => {
  // unstable_noStore();
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

// get all the users that are in the same clan as the current user
export const getMembersByCurrentUserClan = async (guildName: string) => {
  try {
    const members = await db.user.findMany({
      where: { guildName },
      select: {
        username: true,
        image: true,
        hp: true,
        hpMax: true,
        mana: true,
        manaMax: true,
      },
    });
    return members;
  } catch {
    return null;
  }
};
