import { Request, Response } from "express";
import { $Enums, db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import {
  requireAuth,
  requireUserIdAndNew,
} from "../../middleware/authMiddleware.js";
import { ErrorMessage } from "lib/error.js";
import { checkNewUserSecret } from "utils/validators/secretValidation.js";
import { validateBody } from "middleware/validationMiddleware.js";
import z from "zod";
import { validateUserCreation } from "utils/validators/userUpdateValidation.js";

export const updateUserSchema = z.object({
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
  playerClass: z.string(),
  guildId: z.number(),
  image: z.string(),
  schoolClass: z.enum($Enums.SchoolClass, "Invalid school class"),
  publicHighscore: z.boolean(),
  secret: z.string(),
});

interface UpdateUserProps {
  secret: string;
  username: string;
  name: string;
  lastname: string;
  playerClass: $Enums.Class;
  image: string;
  guildId: number;
  schoolClass: $Enums.SchoolClass;
  publicHighscore: boolean;
}

export const updateUser = [
  requireAuth,
  requireUserIdAndNew(),
  validateBody(updateUserSchema),
  async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;

      const data = req.body as UpdateUserProps;

      // backend validation
      if (!(await checkNewUserSecret(userId, data.secret))) {
        return false;
      }

      const formValues = {
        username: data.username,
        name: data.name,
        lastname: data.lastname,
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

      await db.$transaction(async (db) => {
        const guild = await db.guild.findFirst({
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
          await db.guild.update({
            where: { id: validatedData.guildId },
            data: {
              guildLeader: userId,
            },
          });
          // if the guild has one member, set the user as the next guild leader
        } else if (guildMemberCount === 1) {
          await db.guild.update({
            where: { id: validatedData.guildId },
            data: {
              nextGuildLeader: userId,
            },
          });
        }

        await db.user.update({
          where: { id: userId },
          data: {
            role: "USER",
            username: validatedData.username,
            name: validatedData.name,
            lastname: validatedData.lastname,
            class: validatedData.playerClass.slice(0, -1) as $Enums.Class,
            image: validatedData.playerClass,
            guildName: guild?.name,
            schoolClass: validatedData.schoolClass as $Enums.SchoolClass,
            publicHighscore: validatedData.publicHighscore,
            lastMana: new Date(new Date().setDate(new Date().getDate() - 1)),
          },
        });
      });

      res.json({ success: true, data: "Success!" });
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
