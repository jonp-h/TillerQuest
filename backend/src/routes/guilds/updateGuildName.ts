import { Request, Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireUserIdAndActive } from "../../middleware/authMiddleware.js";
import { ErrorMessage } from "lib/error.js";
import { validateBody } from "middleware/validationMiddleware.js";
import z from "zod";
import { escapeHtml } from "utils/validators/validationUtils.js";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";

export const updateGuildNameSchema = z.object({
  newName: z
    .string()
    .min(3, "Guild name must be above 3 characters")
    .max(25, "Guild name must be below 25 characters")
    .regex(/^[A-Za-zŽžÀ-ÿ\s'-]+$/, "Guild name may only contain letters"),
});

interface UpdateGuildNameProps {
  newName: string;
}

export const updateGuildName = [
  requireUserIdAndActive(),
  validateBody(updateGuildNameSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const oldName = req.params.guildName;
      const userId = req.session!.user.id;

      const data = req.body as UpdateGuildNameProps;

      if (oldName === data.newName) {
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
      const guildNameTaken = await db.guild.findFirst({
        where: {
          name: {
            equals: data.newName,
            mode: "insensitive",
          },
        },
      });

      if (guildNameTaken) {
        throw new ErrorMessage("Try a different guild name.");
      }

      // Sanitize inputs
      const validatedData = {
        name: escapeHtml(data.newName),
      };

      await db.$transaction(async (db) => {
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

        await db.guild.update({
          where: {
            name: oldName,
          },
          data: {
            name: validatedData.name,
          },
        });
      });

      res.json({
        success: true,
        data: "Successfully updated guild name to " + data.newName,
      });
    } catch (error) {
      if (error instanceof ErrorMessage) {
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }

      logger.error("Error updating user: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to update user",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
