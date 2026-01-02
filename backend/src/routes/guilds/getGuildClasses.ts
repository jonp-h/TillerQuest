import { Response } from "express";
import { logger } from "../../lib/logger.js";
import { requireAuth, requireUserId } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";
import { guildClasses } from "utils/guilds/guildValidators.js";

// get guild member count of all guilds, excluding the current user in the count and only returning guilds that are not archived
export const getGuildClasses = [
  requireAuth,
  requireUserId(),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const guildId = Number(req.params.guildId);
      const userId = req.session!.user.id;

      const classes = await guildClasses(userId, guildId);

      res.json({ success: true, data: classes });
    } catch (error) {
      logger.error("Error fetching guild classes: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch guild classes",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
