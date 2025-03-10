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

export const getUsersSpecialStatus = async () => {
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
  });
  return users;
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

export const updateUserSpecialStatus = async (
  userId: string,
  special: string[],
) => {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    throw new Error("Not authorized");
  }

  const user = await db.user.update({
    where: {
      id: userId,
    },
    data: {
      special,
    },
  });
  return user;
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
  if (session?.user.role !== "ADMIN") {
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
