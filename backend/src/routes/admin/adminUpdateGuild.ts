import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAdmin, requireAuth } from "../../middleware/authMiddleware.js";
import { ErrorMessage } from "lib/error.js";
import {
  validateBody,
  validateParams,
} from "middleware/validationMiddleware.js";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";
import {
  escapeHtml,
  guildNameParamSchema,
} from "utils/validators/validationUtils.js";
import z from "zod";

interface AdminUpdateGuildMembersRequest extends AuthenticatedRequest {
  body: {
    newName?: string;
    userIds?: string[];
    guildLeaderId?: string;
    nextGuildLeaderId?: string;
    archived?: boolean;
  };
  params: {
    guildName: string;
  };
}

export const updateGuildSchema = z.object({
  newName: z
    .string()
    .min(3, "Guild name must be above 3 characters")
    .max(25, "Guild name must be below 25 characters")
    .regex(
      /^[A-Za-zŽžÀ-ÿ0-9\s'_-]+$/,
      "Guild name may only contain letters, numbers, spaces, hyphens, underscores, and apostrophes",
    )
    .optional(),
  userIds: z
    .array(z.string().regex(/^[a-zA-Z0-9]{32}$/, "Invalid user ID format"))
    .optional(),
  guildLeaderId: z
    .string()
    .regex(/^[a-zA-Z0-9]{32}$/, "Invalid user ID format")
    .optional(),
  nextGuildLeaderId: z
    .string()
    .regex(/^[a-zA-Z0-9]{32}$/, "Invalid user ID format")
    .optional(),
  archived: z.boolean().optional(),
});

export const adminUpdateGuild = [
  requireAuth,
  requireAdmin,
  validateParams(guildNameParamSchema),
  validateBody(updateGuildSchema),
  async (req: AdminUpdateGuildMembersRequest, res: Response) => {
    try {
      const guildName = req.params.guildName;

      const { newName, userIds, guildLeaderId, nextGuildLeaderId, archived } =
        req.body;

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

      // --------- NAME VALIDATION ---------
      let validatedName = newName;
      if (newName) {
        if (guildName === newName) {
          throw new ErrorMessage(
            "New guild name must be different from the old one.",
          );
        }

        if (newName) {
          validatedName = escapeHtml(newName);
        }

        const guildNameTaken = await db.guild.findFirst({
          where: {
            name: { equals: validatedName, mode: "insensitive" },
          },
        });

        if (guildNameTaken) {
          throw new ErrorMessage("A guild with this name already exists.");
        }
      }

      // --------- GUILDLEADER VALIDATION ---------

      const newGuildLeaderIsMemberOfGuild = guild.members.some(
        (member) => member.id === guildLeaderId,
      );
      const newNextGuildLeaderIsMemberOfGuild = guild.members.some(
        (member) => member.id === nextGuildLeaderId,
      );

      if (
        (guildLeaderId && !newGuildLeaderIsMemberOfGuild) ||
        (nextGuildLeaderId && !newNextGuildLeaderIsMemberOfGuild)
      ) {
        throw new ErrorMessage(
          "The selected user is not a member of this guild.",
        );
      }

      // --------- UPDATE GUILD ---------

      await db.guild.update({
        where: {
          name: guildName,
        },
        data: {
          name: newName ? validatedName : undefined,
          guildLeader: guildLeaderId ? guildLeaderId : undefined,
          nextGuildLeader: nextGuildLeaderId ? nextGuildLeaderId : undefined,
          members: userIds
            ? {
                set: userIds?.map((id) => ({ id })),
              }
            : undefined,
          archived: archived ? archived : undefined,
        },
      });

      res.json({
        success: true,
        data: "Successfully updated guild data",
      });
    } catch (error) {
      if (error instanceof ErrorMessage) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
        return;
      }

      logger.error("Error updating guild members: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to update guild members",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
