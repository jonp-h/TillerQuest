import { Request, Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAdmin, requireAuth } from "../../middleware/authMiddleware.js";
import { ErrorMessage } from "lib/error.js";
import { validateBody } from "middleware/validationMiddleware.js";
import z from "zod";

export const adminUpdateNextGuildLeaderSchema = z.object({
  nextGuildLeaderId: z.cuid(),
});

export const adminUpdateNextGuildLeader = [
  requireAuth,
  requireAdmin,
  validateBody(adminUpdateNextGuildLeaderSchema),
  async (req: Request, res: Response) => {
    try {
      const guildName = req.params.guildName;

      const newNextLeaderId = req.body as string;

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

      res.json({
        success: true,
        data: `Successfully updated next guild leader for ${guildName}`,
      });
    } catch (error) {
      if (error instanceof ErrorMessage) {
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }

      logger.error("Error updating next guild leader: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to update next guild leader",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
