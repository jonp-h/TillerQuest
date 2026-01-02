import { Request, Response } from "express";
import { db, SchoolClass } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAdmin, requireAuth } from "../../middleware/authMiddleware.js";
import { ErrorMessage } from "lib/error.js";
import { validateBody } from "middleware/validationMiddleware.js";
import z from "zod";

export const adminUpdateGuildMembersSchema = z.object({
  newName: z
    .string()
    .min(3, "Guild name must be above 3 characters")
    .max(25, "Guild name must be below 25 characters")
    .regex(/^[A-Za-zŽžÀ-ÿ\s'-]+$/, "Guild name may only contain letters"),
  oldName: z.string(),
});

interface UpdateGuildMembersProps {
  id: string;
  name: string | null;
  lastname: string | null;
  schoolClass: SchoolClass | null;
}
[];

export const adminUpdateGuildMembers = [
  requireAuth,
  requireAdmin,
  validateBody(adminUpdateGuildMembersSchema),
  async (req: Request, res: Response) => {
    try {
      const guildName = req.params.guildName;

      const newMembers = req.body as UpdateGuildMembersProps;

      const guilds = await db.guild.update({
        where: {
          name: guildName,
        },
        data: {
          members: {
            set: newMembers,
          },
        },
      });

      res.json({
        success: true,
        data: "Successfully updated guild members for " + guilds.name,
      });
    } catch (error) {
      if (error instanceof ErrorMessage) {
        return res.status(400).json({
          success: false,
          error: error.message,
        });
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
