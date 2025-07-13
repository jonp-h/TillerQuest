"use server";

import { AuthorizationError, checkAdminAuth } from "@/lib/authUtils";
import { db } from "@/lib/db";
import { ErrorMessage } from "@/lib/error";
import { logger } from "@/lib/logger";
import { SchoolClass } from "@prisma/client";

export const updateGuildname = async (oldName: string, newName: string) => {
  try {
    await checkAdminAuth();

    const guildExists = await db.guild.findUnique({
      where: {
        name: newName,
      },
    });

    if (guildExists) {
      throw new ErrorMessage("A guild with this name already exists.");
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
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized admin access attempt to update guild name");
      throw error;
    }

    if (error instanceof ErrorMessage) {
      throw error;
    }

    logger.error("Error updating guild name: " + error);
    throw new Error(
      "Something went wrong while updating the guild name. Error timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
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
  try {
    await checkAdminAuth();

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
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized admin access attempt to update guild members");
      throw error;
    }

    logger.error("Error updating guild members: " + error);
    throw new Error(
      "Something went wrong while updating the guild members. Error timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};
