import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAuth, requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import z from "zod";
import { validateBody } from "../../middleware/validationMiddleware.js";
import { addLog } from "../../utils/logs/addLog.js";
import { sendDiscordMessage } from "../../lib/discord.js";
import { ErrorMessage } from "../../lib/error.js";

const giveArenaTokensSchema = z.object({
  userIds: z.array(z.cuid()),
  value: z.number(),
  notify: z.boolean(),
  reason: z.string().max(40, "Reason must be at most 40 characters"),
});

interface GiveArenaTokensRequest extends AuthenticatedRequest {
  body: {
    userIds: string[];
    value: number;
    notify: boolean;
    reason: string;
  };
}

export const adminGiveArenaTokens = [
  requireAuth,
  requireAdmin,
  validateBody(giveArenaTokensSchema),
  async (req: GiveArenaTokensRequest, res: Response) => {
    try {
      const { userIds, value, notify, reason } = req.body;
      const username = req.session!.user.username || "Admin";

      const usernames = await db.$transaction(async (db) => {
        const users = await db.user.findMany({
          where: {
            id: {
              in: userIds,
            },
          },
          select: {
            id: true,
            username: true,
          },
        });

        await Promise.all(
          users.map(async (user) => {
            await db.user.update({
              where: {
                id: user.id,
              },
              data: {
                arenaTokens: { increment: value },
              },
            });

            await addLog(
              db,
              user.id,
              `${user.username} received ${value} arenatokens from GM ${username}. ${reason}`,
            );
          }),
        );

        return users.map((u) => u.username);
      });

      if (notify && usernames.length > 0) {
        await sendDiscordMessage(
          username,
          "Arenatokens from the Game Masters",
          `User(s) ${usernames.join(", ")} has been given ${value} arenatokens. ${reason}`,
        );
      }

      res.json({
        success: true,
        data: {
          message: `${value} arenatokens given successfully to ${userIds.length} users.`,
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

      logger.error(
        "A game master failed to give arenatokens to users: " + error,
      );
      res.status(500).json({
        success: false,
        error: "Failed to give arena tokens",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
