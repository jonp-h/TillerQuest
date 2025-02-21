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
  if (!session) {
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
