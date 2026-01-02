import { Request, Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAdmin, requireAuth } from "../../middleware/authMiddleware.js";
import { ErrorMessage } from "lib/error.js";
import { validateBody } from "middleware/validationMiddleware.js";
import z from "zod";

export const adminUpdateGuildLeaderSchema = z.object({
  newLeaderId: z.cuid(),
});

export const adminUpdateGuildLeader = [
  requireAuth,
  requireAdmin,
  validateBody(adminUpdateGuildLeaderSchema),
  async (req: Request, res: Response) => {
    try {
      const guildName = req.params.guildName;

      const newLeaderId = req.body as string;

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

      res.json({
        success: true,
        data: `Successfully updated guild leader for ${guildName}`,
      });
    } catch (error) {
      if (error instanceof ErrorMessage) {
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }

      logger.error("Error updating guild leader: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to update guild leader",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
