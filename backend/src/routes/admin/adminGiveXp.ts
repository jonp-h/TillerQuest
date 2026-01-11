import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAuth, requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import z from "zod";
import { validateBody } from "../../middleware/validationMiddleware.js";
import { experienceAndLevelValidator } from "../../utils/abilities/abilityValidators.js";
import { sendDiscordMessage } from "../../lib/discord.js";
import { ErrorMessage } from "../../lib/error.js";

const giveXpSchema = z.object({
  userIds: z.array(
    z.string().regex(/^[a-zA-Z0-9]{32}$/, "Invalid user ID format"),
  ),
  value: z.number(),
  notify: z.boolean(),
  reason: z.string().max(40, "Reason must be at most 40 characters").optional(),
});

interface GiveXpRequest extends AuthenticatedRequest {
  body: {
    userIds: string[];
    value: number;
    notify: boolean;
    reason: string;
  };
}

export const adminGiveXp = [
  requireAuth,
  requireAdmin,
  validateBody(giveXpSchema),
  async (req: GiveXpRequest, res: Response) => {
    try {
      const { userIds, value, notify, reason } = req.body;
      const username = req.session!.user.username || "Admin";

      const usernames = await db.$transaction(async (tx) => {
        const users = await tx.user.findMany({
          where: {
            id: {
              in: userIds,
            },
          },
        });

        await Promise.all(
          users.map(async (user) => {
            await experienceAndLevelValidator(
              tx,
              user.id,
              value,
              reason,
              username,
            );
          }),
        );

        return users.map((u) => u.username);
      });

      if (notify && usernames.length > 0) {
        await sendDiscordMessage(
          username,
          "XP from the Game Masters",
          `User(s) ${usernames.join(", ")} has been given ${value} XP. ${reason}`,
        );
      }

      res.json({
        success: true,
        data: {
          message: `${value} XP given successfully to ${userIds.length} users.`,
        },
      });
    } catch (error) {
      if (error instanceof ErrorMessage) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
        return;
      }

      logger.error("A game master failed to give XP to users: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to give XP",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
