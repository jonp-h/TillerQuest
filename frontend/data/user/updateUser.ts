"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { $Enums } from "@prisma/client";

interface UpdateUserProps {
  secret: string;
  username: string;
  name: string;
  lastname: string;
  class: $Enums.Class;
  image: string;
  guildName: string;
  schoolClass: $Enums.SchoolClass;
  publicHighscore: boolean;
  lastMana: Date;
}

// used on account creation page
export const updateUser = async (id: string, data: UpdateUserProps) => {
  const session = await auth();
  if (!session || session?.user?.id !== id) {
    throw new Error("Not authorized");
  }

  console.log("secret: " + data.secret);
  if (data.secret !== process.env.NEW_USER_SECRET) {
    console.log("secret true: " + data.secret);
    return "Not authorized";
  }

  try {
    await db.user.update({
      where: { id },
      data: {
        role: "USER",
        username: data.username,
        name: data.name,
        lastname: data.lastname,
        class: data.class,
        image: data.image,
        guildName: data.guildName,
        schoolClass: data.schoolClass,
        publicHighscore: data.publicHighscore,
        lastMana: data.lastMana,
      },
    });
    return true;
  } catch {
    return false;
  }
};

export const updateProfile = async (
  id: string,
  data: { username: string; publicHighscore: boolean; archiveConsent: boolean },
) => {
  const session = await auth();
  if (!session || session?.user?.id !== id || session?.user?.role === "NEW") {
    throw new Error("Not authorized");
  }

  try {
    await db.user.update({
      where: { id },
      data: {
        username: data.username,
        publicHighscore: data.publicHighscore,
        archiveConsent: data.archiveConsent,
      },
    });
    return true;
  } catch {
    return false;
  }
};
