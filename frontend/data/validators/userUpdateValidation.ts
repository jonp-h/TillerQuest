"use server";

import { auth } from "@/auth";
import {
  escapeHtml,
  newUserSchema,
  updateUserSchema,
} from "@/lib/userValidation";
import { getGuildmemberCount } from "../guilds/getGuilds";
import { db } from "@/lib/db";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validateUserCreation = async (id: string, data: any) => {
  const session = await auth();
  if (session?.user.id !== id || session?.user.role !== "NEW" || !session) {
    return "Not authorized";
  }

  const validatedData = newUserSchema.safeParse(data);

  if (!validatedData.success) {
    return validatedData.error.errors.map((e) => e.message).join(", ");
  }

  //TODO: use guild and schoolclass restrictions?
  // // validate if the user guild has the same schoolclass
  // const guildSchoolClass = await db.guild.findFirst({
  //   where: {
  //     name: {
  //       equals: validatedData.data.guild,
  //     },
  //   },
  //   select: {
  //     schoolClass: true,
  //   },
  // });

  // if (guildSchoolClass?.schoolClass !== validatedData.data.schoolClass) {
  //   return "The chosen guild is not available for your school class";
  // }

  // validate if the user guild is full
  const guildCount = await getGuildmemberCount(id, validatedData.data.guild);
  if (guildCount >= 5) {
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
      name: {
        equals: validatedData.data.guild,
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

  // Sanitize inputs
  const sanitizedData = {
    username: escapeHtml(validatedData.data.username),
    name: escapeHtml(validatedData.data.name),
    lastname: escapeHtml(validatedData.data.lastname),
    playerClass: escapeHtml(validatedData.data.playerClass),
    guild: escapeHtml(validatedData.data.guild),
    schoolClass: escapeHtml(validatedData.data.schoolClass),
    publicHighscore: validatedData.data.publicHighscore,
  };

  return sanitizedData;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validateUserUpdate = async (id: string, data: any) => {
  const session = await auth();
  if (session?.user.id !== id || session?.user.role === "NEW" || !session) {
    return "Not authorized";
  }

  const validatedData = updateUserSchema.safeParse(data);

  if (!validatedData.success) {
    return validatedData.error.errors.map((e) => e.message).join(", ");
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
