import { Response } from "express";
import { db, SchoolClass } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAdmin, requireAuth } from "../../middleware/authMiddleware.js";
import { ErrorMessage } from "lib/error.js";
import {
  validateBody,
  validateParams,
} from "middleware/validationMiddleware.js";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";
import {
  adminUpdateGuildMembersSchema,
  guildNameParamSchema,
} from "utils/validators/validationUtils.js";

interface AdminUpdateGuildMembersRequest extends AuthenticatedRequest {
  body: {
    id: string;
    name: string | null;
    lastname: string | null;
    schoolClass: SchoolClass | null;
  }[];
  params: {
    guildName: string;
  };
}

export const adminUpdateGuildMembers = [
  requireAuth,
  requireAdmin,
  validateParams(guildNameParamSchema),
  validateBody(adminUpdateGuildMembersSchema),
  async (req: AdminUpdateGuildMembersRequest, res: Response) => {
    try {
      const guildName = req.params.guildName;

      const newMembers = req.body;

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
