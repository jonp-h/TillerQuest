import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import {
  requireAuth,
  requireUserIdAndInactive,
} from "../../middleware/authMiddleware.js";
import { ErrorMessage } from "lib/error.js";
import {
  validateBody,
  validateParams,
} from "middleware/validationMiddleware.js";
import { validateUserCreation } from "utils/validators/userUpdateValidation.js";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";
import { userIdParamSchema } from "utils/validators/validationUtils.js";
import { Class, SchoolClass } from "@tillerquest/prisma/browser";
import z from "zod";

interface UserUpdateRequest extends AuthenticatedRequest {
  body: {
    username: string;
    name: string;
    lastname: string;
    playerClass: Class;
    image: string;
    guildId: number;
    schoolClass: SchoolClass;
    publicHighscore: boolean;
    archiveConsent: boolean;
  };
}

const resetUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be above 3 characters")
    .max(20, "Username must be below 20 characters")
    .regex(
      /^[a-zA-Z0-9-_]+$/,
      "Username may only contain latin letters, numbers, - and _",
    ),
  name: z
    .string()
    .min(3, "Given name must be above 3 characters")
    .max(20, "Given name must be below 20 characters")
    .regex(/^[A-Za-zŽžÀ-ÿ\s'-]+$/, "Given name may only contain letters"),
  lastname: z
    .string()
    .min(3, "Lastname must be above 3 characters")
    .max(20, "Lastname must be below 20 characters")
    .regex(/^[A-Za-zŽžÀ-ÿ\s'-]+$/, "Lastname may only contain letters"),
  playerClass: z.enum(Class, "Invalid class"),
  guildId: z.number().positive("Guild ID must be a positive number"),
  image: z.string().min(1),
  schoolClass: z.enum(SchoolClass, "Invalid school class"),
  publicHighscore: z.boolean(),
  archiveConsent: z.boolean(),
});

export const resetUser = [
  requireAuth,
  requireUserIdAndInactive(),
  validateParams(userIdParamSchema),
  validateBody(resetUserSchema),
  async (req: UserUpdateRequest, res: Response) => {
    try {
      const userId = req.params.userId;

      if (req.session?.user.role !== "INACTIVE") {
        throw new ErrorMessage("Only INACTIVE users can be reset");
      }

      const data = req.body;

      const formValues = {
        username: data.username,
        name: data.name,
        lastname: data.lastname,
        image: data.image,
        playerClass: data.playerClass,
        guildId: data.guildId,
        schoolClass: data.schoolClass,
        publicHighscore: data.publicHighscore,
        archiveConsent: data.archiveConsent,
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
            archiveConsent: validatedData.archiveConsent,
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
