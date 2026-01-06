import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import {
  requireActiveUser,
  requireAuth,
} from "../../middleware/authMiddleware.js";
import { ErrorMessage } from "lib/error.js";
import {
  validateBody,
  validateParams,
} from "middleware/validationMiddleware.js";
import {
  escapeHtml,
  guildNameParamSchema,
  updateGuildNameSchema,
} from "utils/validators/validationUtils.js";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";

interface UpdateGuildNameRequest extends AuthenticatedRequest {
  body: {
    newName: string;
  };
}

export const updateGuildName = [
  requireAuth,
  requireActiveUser,
  validateParams(guildNameParamSchema),
  validateBody(updateGuildNameSchema),
  async (req: UpdateGuildNameRequest, res: Response) => {
    try {
      const oldName = req.params.guildName;
      const userId = req.session!.user.id;

      const { newName } = req.body;

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
      const guildNameTaken = await db.guild.findFirst({
        where: {
          name: {
            equals: newName,
            mode: "insensitive",
          },
        },
      });

      if (guildNameTaken) {
        throw new ErrorMessage("Try a different guild name.");
      }

      // Sanitize inputs
      const validatedData = {
        name: escapeHtml(newName),
      };

      await db.$transaction(async (tx) => {
        const guildExists = await tx.guild.findUnique({
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

        await tx.guild.update({
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
        data: "Successfully updated guild name to " + newName,
      });
    } catch (error) {
      if (error instanceof ErrorMessage) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
        return;
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
