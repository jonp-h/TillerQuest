"use server";

import {
  AuthorizationError,
  validateAdminAuth,
  validateUserIdAndActiveUserAuth,
} from "@/lib/authUtils";
import { db } from "@/lib/db";
import { ErrorMessage } from "@/lib/error";
import { logger } from "@/lib/logger";
import { SchoolClass } from "@prisma/client";
import { validateGuildNameUpdate } from "../validators/guildUpdateValidation";
import { ServerActionResult } from "@/types/serverActionResult";

export const updateGuildname = async (
  userId: string,
  oldName: string,
  newName: string,
): Promise<ServerActionResult> => {
  try {
    await validateUserIdAndActiveUserAuth(userId);

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

    if (!validatedData.success) {
      throw new ErrorMessage(validatedData.error);
    }

    return await db.$transaction(async (db) => {
      const guildExists = await db.guild.findUnique({
        where: {
          name: validatedData.data,
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
          name: validatedData.data,
        },
      });

      return {
        success: true,
        data: "Successfully updated guild name to " + guilds.name,
      };
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized admin access attempt to update guild name");
      return {
        success: false,
        error: error.message,
      };
    }

    if (error instanceof ErrorMessage) {
      return {
        success: false,
        error: error.message,
      };
    }

    logger.error("Error updating guild name: " + error);
    return {
      success: false,
      error:
        "Something went wrong while updating the guild name. Error timestamp: " +
        Date.now().toLocaleString("no-NO"),
    };
  }
};

export const adminUpdateGuildname = async (
  oldName: string,
  newName: string,
): Promise<ServerActionResult> => {
  try {
    await validateAdminAuth();

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

    return {
      success: true,
      data: "Successfully updated guild name to " + guilds.name,
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized admin access attempt to update guild name");
      return {
        success: false,
        error: error.message,
      };
    }

    if (error instanceof ErrorMessage) {
      return {
        success: false,
        error: error.message,
      };
    }

    logger.error("Error updating guild name: " + error);
    return {
      success: false,
      error:
        "Something went wrong while updating the guild name. Error timestamp: " +
        Date.now().toLocaleString("no-NO"),
    };
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
): Promise<ServerActionResult> => {
  try {
    await validateAdminAuth();

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

    return {
      success: true,
      data: "Successfully updated guild members for " + guilds.name,
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized admin access attempt to update guild members");
      return {
        success: false,
        error: error.message,
      };
    }

    logger.error("Error updating guild members: " + error);
    return {
      success: false,
      error:
        "Something went wrong while updating the guild members. Error timestamp: " +
        Date.now().toLocaleString("no-NO"),
    };
  }
};

export const adminUpdateGuildLeader = async (
  guildName: string,
  newLeaderId: string | null,
): Promise<ServerActionResult> => {
  try {
    await validateAdminAuth();

    // If a new leader is specified, verify they are a member of the guild
    if (newLeaderId) {
      const guild = await db.guild.findUnique({
        where: { name: guildName },
        select: {
          members: {
            select: { id: true },
          },
        },
      });

      if (!guild) {
        throw new ErrorMessage("Guild not found.");
      }

      const isMember = guild.members.some(
        (member) => member.id === newLeaderId,
      );
      if (!isMember) {
        throw new ErrorMessage(
          "The selected user is not a member of this guild.",
        );
      }
    }

    await db.guild.update({
      where: {
        name: guildName,
      },
      data: {
        guildLeader: newLeaderId,
      },
    });

    return {
      success: true,
      data: `Successfully updated guild leader for ${guildName}`,
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized admin access attempt to update guild name");
      return {
        success: false,
        error: error.message,
      };
    }

    if (error instanceof ErrorMessage) {
      return {
        success: false,
        error: error.message,
      };
    }

    logger.error("Error updating guild name: " + error);
    return {
      success: false,
      error:
        "Something went wrong while updating the guild name. Error timestamp: " +
        Date.now().toLocaleString("no-NO"),
    };
  }
};

export const adminUpdateNextGuildLeader = async (
  guildName: string,
  newNextLeaderId: string | null,
): Promise<ServerActionResult> => {
  try {
    await validateAdminAuth();

    // If a new next leader is specified, verify they are a member of the guild
    if (newNextLeaderId) {
      const guild = await db.guild.findUnique({
        where: { name: guildName },
        select: {
          members: {
            select: { id: true },
          },
        },
      });

      if (!guild) {
        throw new ErrorMessage("Guild not found.");
      }

      const isMember = guild.members.some(
        (member) => member.id === newNextLeaderId,
      );
      if (!isMember) {
        throw new ErrorMessage(
          "The selected user is not a member of this guild.",
        );
      }
    }

    const updatedGuild = await db.guild.update({
      where: {
        name: guildName,
      },
      data: {
        nextGuildLeader: newNextLeaderId,
      },
    });

    return {
      success: true,
      data: `Successfully updated next guild leader for ${updatedGuild.name}`,
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized admin access attempt to update guild name");
      return {
        success: false,
        error: error.message,
      };
    }

    if (error instanceof ErrorMessage) {
      return {
        success: false,
        error: error.message,
      };
    }

    logger.error("Error updating guild name: " + error);
    return {
      success: false,
      error:
        "Something went wrong while updating the guild name. Error timestamp: " +
        Date.now().toLocaleString("no-NO"),
    };
  }
};
