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

  // validate if the user guild is full. Fallback to 6 if no setting is found
  const guildSize = await db.applicationSettings.findFirst({
    where: {
      key: "MAX_GUILD_MEMBERS",
    },
  });

  const guildCount = await getGuildmemberCount(id, validatedData.data.guildId);
  if (guildCount >= (Number(guildSize?.value) || 6)) {
    return "Guild is full";
  }

  const targetGuild = await db.guild.findFirst({
    where: {
      id: {
        equals: validatedData.data.guildId,
      },
    },
    select: {
      schoolClass: true,
      members: {
        select: {
          class: true,
          id: true,
        },
      },
    },
  });

  if (
    !(await validateSchoolClassRestrictions(
      validatedData.data.schoolClass,
      targetGuild?.schoolClass || "",
    ))
  ) {
    return "The chosen guild is not available for your school class.";
  }

  // validate if the guild already has a member with the chosen class
  if (
    targetGuild?.members.some(
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

/**
 * Validates whether a user with a given school class can join or interact with a target school class based on application settings.
 *
 * @param userSchoolClass - The school class of the user attempting the action.
 * @param targetSchoolClass - The school class of the target entity (e.g., guild) the user is trying to join or interact with.
 * @return A boolean indicating whether the action is permitted based on the school class restrictions. True if permitted, false otherwise.
 */
const validateSchoolClassRestrictions = async (
  userSchoolClass: string,
  targetSchoolClass: string,
) => {
  const restrictionSettings = await db.applicationSettings.findFirst({
    where: {
      key: "SCHOOL_CLASS_RESTRICTION",
    },
  });

  if (!restrictionSettings) {
    // Default to same class restriction if no settings
    return userSchoolClass === targetSchoolClass;
  }

  switch (restrictionSettings.value) {
    case "SAME_CLASS":
      return userSchoolClass === targetSchoolClass;
    case "CLASS_GROUPS":
      const group = await db.applicationSettings.findFirst({
        where: {
          key: "SCHOOL_CLASS_GROUPS",
        },
      });

      // split groups based on the format: "1IM1,1IM2;1IM3,1IM4;2IT1,2IT2".
      // Comma seperate classes in the same group, semicolon seperate different groups
      const classGroups =
        group?.value.split(",").map((g: string) => g.split(";")) || [];

      if (classGroups.length === 0) {
        return userSchoolClass === targetSchoolClass;
      } else if (
        classGroups.some(
          (group: string[]) =>
            group.includes(userSchoolClass) &&
            group.includes(targetSchoolClass),
        )
      ) {
        return true;
      } else {
        return false;
      }
    case "ANY":
      return true;
    default:
      return userSchoolClass === targetSchoolClass;
  }
};
