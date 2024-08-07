"use server";
import { db } from "@/lib/db";
import { User } from "@prisma/client";
import { checkManaPassives } from "./passives";
import { dailyMana, gemstonesOnLevelUp, xpMultiplier } from "@/lib/gameSetting";

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

export const getMana = async (user: User) => {
  // get passiveValue from mana passive
  let passiveValue = (await checkManaPassives(user.id)) ?? 0;

  // the daily mana is 4
  let mana = dailyMana + passiveValue;

  // use get mana
  return db.user.update({
    where: { id: user.id },
    data: { mana: { increment: mana }, lastMana: new Date() },
  });
};

// XP functions

export const giveXP = async (users: User[], xp: number) => {
  try {
    db.user.updateMany({
      where: { id: { in: users.map((user) => user.id) } },
      data: { xp: { increment: xp } },
    });

    users.map(async (user) => {
      checkLevelUp(user);
    });

    return "Success";
  } catch (error) {
    console.error(error);
    return error;
  }
};

export const checkLevelUp = async (user: User) => {
  if (user.xp >= user.xpToLevel) {
    const excessXp = user.xp - user.xpToLevel;
    const newXpToLevel = user.xpToLevel * xpMultiplier;
    const newLevel = user.level + 1;

    await db.user.update({
      where: { id: user.id },
      data: {
        level: newLevel,
        xp: excessXp,
        xpToLevel: newXpToLevel,
        gemstones: { increment: gemstonesOnLevelUp },
      },
    });
    checkLevelUp({
      ...user,
      xp: excessXp,
      xpToLevel: newXpToLevel,
      level: newLevel,
    });
  }
};
