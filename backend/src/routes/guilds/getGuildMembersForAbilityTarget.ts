import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireActiveUser } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";
import { validateParams } from "middleware/validationMiddleware.js";
import { guildNameParamSchema } from "utils/validators/validationUtils.js";

export const getGuildMembersForAbilityTarget = [
  requireActiveUser,
  validateParams(guildNameParamSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const guildName = req.params.guildName;
      const members = await db.user.findMany({
        where: { guildName },
        select: {
          id: true,
          title: true,
          titleRarity: true,
          username: true,
          image: true,
          hp: true,
          hpMax: true,
          mana: true,
          manaMax: true,
        },
        orderBy: {
          username: "desc",
        },
      });

      res.json({ success: true, data: members });
    } catch (error) {
      logger.error("Error fetching guild members for ability target: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch guild members for ability target",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
