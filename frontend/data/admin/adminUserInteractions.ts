"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";

export const getAllUsers = async () => {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    throw new Error("Not authorized");
  }

  const users = await db.user.findMany({
    where: {
      role: {
        not: "NEW",
      },
    },
    orderBy: [
      {
        schoolClass: "asc",
      },
      {
        name: "asc",
      },
      {
        lastname: "asc",
      },
    ],
  });
  return users;
};

export const getBasicUserDetails = async () => {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    throw new Error("Not authorized");
  }

  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      lastname: true,
      schoolClass: true,
    },
    orderBy: [
      {
        schoolClass: "asc",
      },
      {
        name: "asc",
      },
      {
        lastname: "asc",
      },
    ],
  });
  return users;
};

export const getAllDeadUsers = async () => {
  const session = await auth();
  if (!session || session?.user.role === "NEW") {
    throw new Error("Not authorized");
  }

  const deadUsers = await db.user.findMany({
    where: {
      hp: {
        equals: 0,
      },
    },
  });
  return deadUsers;
};

export const adminGetUserInfo = async () => {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    return null;
  }

  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      lastname: true,
      username: true,
      special: true,
      role: true,
    },
    orderBy: [
      {
        schoolClass: "desc",
      },
      {
        name: "asc",
      },
      {
        lastname: "asc",
      },
    ],
  });
  return users;
};

export const adminGetDungeonInfo = async () => {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    return null;
  }

  const dungeons = await db.guild.findMany({
    select: {
      name: true,
      enemies: {
        select: {
          id: true,
          health: true,
          enemy: {
            select: {
              name: true,
              attack: true,
              icon: true,
              maxHealth: true,
            },
          },
        },
      },
    },
  });

  // const dungeons = await db.guildEnemy.findMany({
  //   select: {
  //     id: true,
  //     health: true,
  //     enemy: {
  //       select: {
  //         name: true,
  //         attack: true,
  //         icon: true,
  //         maxHealth: true,
  //       },
  //     },
  //     guild: {
  //       select: {
  //         name: true,
  //       },
  //     },
  //   },
  // });
  return dungeons;
};

export const getAllEnemyTypes = async () => {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    return null;
  }

  const enemyTypes = await db.enemy.findMany();

  return enemyTypes;
};

export const getSpecialStatuses = async () => {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    return null;
  }

  const specialReqs = await db.shopItem.findMany({
    where: {
      specialReq: {
        not: null,
      },
    },
    select: {
      specialReq: true,
    },
  });
  return specialReqs;
};

export const adminUpdateUser = async (
  userId: string,
  special: string[],
  name?: string | null,
  username?: string | null,
  lastname?: string | null,
) => {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    throw new Error("Not authorized");
  }
  try {
    const user = await db.user.update({
      where: {
        id: userId,
      },
      data: {
        name,
        username,
        lastname,
        special,
      },
    });
    return user;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.code === "P2002" && error.meta?.target?.includes("username")) {
      throw new Error("Username already exists.");
    }
    throw error;
  }
};

export const changeUserRole = async (userId: string, role: string) => {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    throw new Error("Not authorized");
  }

  const user = await db.user.update({
    where: {
      id: userId,
    },
    data: {
      role: role as UserRole,
    },
  });
  return user;
};

export const updateRole = async (userId: string, role: UserRole) => {
  const session = await auth();
  if (!session || session?.user.role !== "ADMIN") {
    throw new Error("Not authorized");
  }

  const user = await db.user.update({
    where: {
      id: userId,
    },
    data: {
      role,
    },
  });
  return user;
};
