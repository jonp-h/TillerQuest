"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export const getAllUsers = async () => {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    throw new Error("Not authorized");
  }

  const users = await db.user.findMany();
  return users;
};

export const getAllDeadUsers = async () => {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
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
