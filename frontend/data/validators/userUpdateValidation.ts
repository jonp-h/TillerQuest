"use server";

import {
  escapeHtml,
  newUserSchema,
  updateUserSchema,
} from "@/lib/validationUtils";
import { getGuildmemberCount } from "../guilds/getGuilds";
import { db } from "@/lib/db";
import {
  validateUserIdAndActiveUserAuth,
  validateUserIdAndNewUserAuth,
} from "@/lib/authUtils";
import { prettifyError } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validateUserCreation = async (id: string, data: any) => {
  await validateUserIdAndNewUserAuth(id);

  const validatedData = newUserSchema.safeParse(data);

  if (!validatedData.success) {
    return prettifyError(validatedData.error);
  }

  //TODO: consider if guild and schoolclass restrictions are necessary
  // validate if the user guild has the same schoolclass
  const guildSchoolClass = await db.guild.findFirst({
    where: {
      id: {
        equals: validatedData.data.guildId,
      },
    },
    select: {
      schoolClass: true,
    },
  });

  if (guildSchoolClass?.schoolClass !== validatedData.data.schoolClass) {
    return "The chosen guild is not available for your school class";
  }

  // validate if the user guild is full
  const guildCount = await getGuildmemberCount(id, validatedData.data.guildId);
  if (guildCount >= 6) {
    return "Guild is full";
  }

  const userNameTaken = await db.user.findFirst({
    where: {
      username: {
        equals: validatedData.data.username,
        mode: "insensitive",
      },
      NOT: {
        id: id,
      },
    },
  });

  if (userNameTaken) {
    return "Try a different username";
  }

  // validate if the guild already has a member with the chosen class
  const guildClasses = await db.guild.findFirst({
    where: {
      id: {
        equals: validatedData.data.guildId,
      },
    },
    select: {
      members: {
        select: {
          class: true,
          id: true,
        },
      },
    },
  });

  if (
    guildClasses?.members.some(
      (member) =>
        member.class === validatedData.data.playerClass.slice(0, -1) &&
        member.id !== id,
    )
  ) {
    return (
      validatedData.data.playerClass.slice(0, -1) +
      " already exists in this guild. Choose a different class or guild."
    );
  }

  // Capitalize all parts of the name, including middle names
  const capitalizeFullName = (str: string) =>
    str
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");

  // Sanitize inputs
  const sanitizedData = {
    username: escapeHtml(validatedData.data.username),
    name: capitalizeFullName(escapeHtml(validatedData.data.name)),
    lastname: capitalizeFullName(escapeHtml(validatedData.data.lastname)),
    playerClass: escapeHtml(validatedData.data.playerClass),
    guildId: validatedData.data.guildId,
    schoolClass: escapeHtml(validatedData.data.schoolClass),
    publicHighscore: validatedData.data.publicHighscore,
  };

  return sanitizedData;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validateUserUpdate = async (id: string, data: any) => {
  await validateUserIdAndActiveUserAuth(id);

  const validatedData = updateUserSchema.safeParse(data);

  if (!validatedData.success) {
    return prettifyError(validatedData.error);
  }

  const userNameTaken = await db.user.findFirst({
    where: {
      username: {
        equals: validatedData.data.username,
        mode: "insensitive",
      },
      NOT: {
        id: id,
      },
    },
  });

  if (userNameTaken) {
    return "Try a different username";
  }

  // Sanitize inputs
  const sanitizedData = {
    username: escapeHtml(validatedData.data.username),
    publicHighscore: validatedData.data.publicHighscore,
    archiveConsent: validatedData.data.archiveConsent,
  };

  return sanitizedData;
};
