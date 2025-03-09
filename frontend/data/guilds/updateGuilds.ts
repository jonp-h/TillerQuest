"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { SchoolClass } from "@prisma/client";

export const updateGuildname = async (oldName: string, newName: string) => {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Not authorized");
  }

  const guilds = await db.guild.update({
    where: {
      name: oldName,
    },
    data: {
      name: newName,
    },
  });

  return guilds;
};

export const updateGuildmembers = async (
  name: string,
  newMembers: {
    id: string;
    name: string | null;
    lastname: string | null;
    schoolClass: SchoolClass | null;
  }[],
) => {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Not authorized");
  }

  const guilds = await db.guild.update({
    where: {
      name: name,
    },
    data: {
      members: {
        set: newMembers,
      },
    },
  });

  return guilds;
};
