import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireUserIdAndNew } from "../../middleware/authMiddleware.js";
import { ErrorMessage } from "lib/error.js";
import { checkNewUserSecret } from "utils/validators/secretValidation.js";
import {
  validateBody,
  validateParams,
} from "middleware/validationMiddleware.js";
import { validateUserCreation } from "utils/validators/userUpdateValidation.js";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";
import {
  updateUserSchema,
  userIdParamSchema,
} from "utils/validators/validationUtils.js";
import { Class, SchoolClass } from "@tillerquest/prisma/browser";

interface UserUpdateRequest extends AuthenticatedRequest {
  body: {
    secret: string;
    username: string;
    name: string;
    lastname: string;
    playerClass: Class;
    image: string;
    guildId: number;
    schoolClass: SchoolClass;
    publicHighscore: boolean;
  };
}

export const updateUser = [
  requireUserIdAndNew(),
  validateParams(userIdParamSchema),
  validateBody(updateUserSchema),
  async (req: UserUpdateRequest, res: Response) => {
    try {
      const userId = req.params.userId;

      const data = req.body;

      // backend validation
      if (!(await checkNewUserSecret(userId, data.secret))) {
        throw new ErrorMessage("Invalid secret provided.");
      }

      const formValues = {
        username: data.username,
        name: data.name,
        lastname: data.lastname,
        image: data.image,
        playerClass: data.playerClass,
        guildId: data.guildId,
        schoolClass: data.schoolClass,
        publicHighscore: data.publicHighscore,
      };

      // backend validation
      const validatedData = await validateUserCreation(userId, formValues);

      if (typeof validatedData == "string") {
        throw new ErrorMessage(validatedData);
      }

      await db.$transaction(async (tx) => {
        const guild = await tx.guild.findFirst({
          where: { id: validatedData.guildId },
          select: {
            _count: {
              select: { members: true },
            },
            name: true,
          },
        });

        if (!guild) {
          throw new ErrorMessage(
            "Guild not found. Please refresh the page, and try again.",
          );
        }

        const guildMemberCount = guild?._count.members || 0;

        // if the guild has no members, set the user as the guild leader
        if (guildMemberCount === 0) {
          await tx.guild.update({
            where: { id: validatedData.guildId },
            data: {
              guildLeader: userId,
            },
          });
          // if the guild has one member, set the user as the next guild leader
        } else if (guildMemberCount === 1) {
          await tx.guild.update({
            where: { id: validatedData.guildId },
            data: {
              nextGuildLeader: userId,
            },
          });
        }

        await tx.user.update({
          where: { id: userId },
          data: {
            role: "USER",
            username: validatedData.username,
            name: validatedData.name,
            lastname: validatedData.lastname,
            class: validatedData.playerClass as Class,
            image: validatedData.image,
            guildName: guild?.name,
            schoolClass: validatedData.schoolClass as SchoolClass,
            publicHighscore: validatedData.publicHighscore,
            lastMana: new Date(new Date().setDate(new Date().getDate() - 1)),
          },
        });
      });

      res.json({ success: true, data: "Success!" });
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
