"use server";

import { db } from "@/lib/db";

export const getAllUsers = async () => {
  const users = await db.user.findMany();
  return users;
};

export const getAllDeadUsers = async () => {
  const deadUsers = await db.user.findMany({
    where: {
      hp: {
        equals: 0,
      },
    },
  });
  return deadUsers;
};
