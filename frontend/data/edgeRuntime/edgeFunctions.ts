"use server";

import { db } from "@/lib/db";
import { ErrorMessage } from "@/lib/error";
import { checkNewUserSecret } from "../validators/secretValidation";
import { auth } from "@/auth";
import { $Enums } from "@prisma/client";
import { validateUserCreation } from "./userUpdateValidation";

// Functions mainly for use in the edge environment

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
}

// Only used by auth.ts
export const getUserAuthById = async (id: string) => {
  // unstable_noStore();

  try {
    // TODO: improve authentication by reworking creation page useSession
    // await checkNewUserAuth()

    const user = await db.user.findUnique({
      where: { id },
      select: {
        username: true,
        class: true,
        role: true,
      },
    });

    return user;
  } catch {
    return null;
  }
};

// used on account creation page
export const updateUser = async (id: string, data: UpdateUserProps) => {
  try {
    const session = await auth();

    if (!session) {
      throw new ErrorMessage("Unauthorized access");
    }

    if (session.user.id !== id) {
      throw new ErrorMessage("Unauthorized access");
    }
    // backend validation
    if (!(await checkNewUserSecret(id, data.secret))) {
      return false;
    }

    const formValues = {
      username: data.username,
      name: data.name,
      lastname: data.lastname,
      playerClass: data.class,
      guild: data.guildName,
      schoolClass: data.schoolClass,
      publicHighscore: data.publicHighscore,
    };

    // backend validation
    const validatedData = await validateUserCreation(id, formValues);

    if (typeof validatedData == "string") {
      throw new ErrorMessage(validatedData);
    }

    await db.user.update({
      where: { id },
      data: {
        role: "USER",
        username: validatedData.username,
        name: validatedData.name,
        lastname: validatedData.lastname,
        class: validatedData.playerClass.slice(0, -1) as $Enums.Class,
        image: validatedData.playerClass,
        guildName: validatedData.guild,
        schoolClass: validatedData.schoolClass as $Enums.SchoolClass,
        publicHighscore: validatedData.publicHighscore,
        lastMana: new Date(new Date().setDate(new Date().getDate() - 1)),
      },
    });
    return true;
  } catch (error) {
    if (error instanceof ErrorMessage) {
      console.warn("Error updating user: " + error.message);
      throw error;
    }

    console.error("Error updating user: " + error);

    return false;
  }
};

// get guild member count, excluding the current user
export const getGuildmemberCount = async (
  userId: string,
  guildName: string,
) => {
  try {
    const session = await auth();
    if (!session || session.user.id !== userId) {
      throw new ErrorMessage("Unauthorized access");
    }

    const guild = await db.guild.findFirst({
      where: {
        name: guildName,
      },
      include: {
        _count: {
          select: {
            members: {
              where: {
                id: {
                  not: userId,
                },
              },
            },
          },
        },
      },
    });

    return guild?._count.members || 0;
  } catch (error) {
    if (error instanceof ErrorMessage) {
      console.warn(
        "Unauthorized access attempt to get guild member count for " +
          guildName,
      );
      throw error;
    }
    console.error("Error fetching guild member count: " + error);
    throw new Error(
      "Something went wrong while fetching guild member count. Please inform a game master of this timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};
