import { db } from "../lib/db.js";
import { User } from "@prisma/client";
import { dailyMana } from "../gameSettings.js";

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

// used on account creation page
// TODO: consider implementation of typesafety from auth.ts
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

// get all the users that are in the same guild as the current user
export const getMembersByCurrentUserGuild = async (guildName: string) => {
  try {
    const members = await db.user.findMany({
      where: { guildName },
      select: {
        id: true,
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

// export const getMana = async (user: User) => {
//   // get passiveValue from mana passive and add it to the daily mana, based on the user's max mana
//   let manaValue = (await checkMana(user.id, dailyMana)) ?? 0;

//   // use get mana
//   return db.user.update({
//     where: { id: user.id },
//     data: { mana: { increment: manaValue }, lastMana: new Date() },
//   });
// };
