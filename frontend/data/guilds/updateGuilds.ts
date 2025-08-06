"use server";

import {
  AuthorizationError,
  checkAdminAuth,
  checkUserIdAndActiveAuth,
} from "@/lib/authUtils";
import { db } from "@/lib/db";
import { ErrorMessage } from "@/lib/error";
import { logger } from "@/lib/logger";
import { SchoolClass } from "@prisma/client";
import { validateGuildNameUpdate } from "../validators/guildUpdateValidation";

export const updateGuildname = async (
  userId: string,
  oldName: string,
  newName: string,
) => {
  try {
    await checkUserIdAndActiveAuth(userId);

    if (oldName === newName) {
      throw new ErrorMessage(
        "New guild name must be different from the old one.",
      );
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        username: true,
        guild: {
          select: {
            guildLeader: true,
          },
        },
      },
    });

    if (user?.guild?.guildLeader !== userId) {
      throw new ErrorMessage(
        "Only the guild leader can change the guild name.",
      );
    }

    // backend validation
    const validatedData = await validateGuildNameUpdate(userId, newName);

    if (typeof validatedData == "string") {
      throw new ErrorMessage(validatedData);
    }

    return await db.$transaction(async (db) => {
      const guildExists = await db.guild.findUnique({
        where: {
          name: validatedData.name,
        },
      });

      if (guildExists) {
        throw new ErrorMessage("A guild with this name already exists.");
      }

      //TODO: Consider the need for a cost to change the guild name
      // // withdraw cost
      // await db.user
      //   .findUnique({
      //     where: { id: userId },
      //     select: { gold: true },
      //   })
      //   .then((user) => {
      //     if (!user || user.gold < 10000) {
      //       throw new ErrorMessage(
      //         "You do not have enough gold to change the guild name.",
      //       );
      //     }
      //   });

      // await db.user.update({
      //   where: { id: userId },
      //   data: {
      //     gold: {
      //       decrement: 10000,
      //     },
      //   },
      // });

      const guilds = await db.guild.update({
        where: {
          name: oldName,
        },
        data: {
          name: validatedData.name,
        },
      });

      return "Successfully updated guild name to " + guilds.name;
    });
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

export const adminUpdateGuildname = async (
  oldName: string,
  newName: string,
) => {
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
