import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import z from "zod";
import { validateBody } from "../../middleware/validationMiddleware.js";
import { manaValidator } from "../../utils/abilities/abilityValidators.js";
import { addLog } from "../../utils/logs/addLog.js";
import { sendDiscordMessage } from "../../lib/discord.js";
import { ErrorMessage } from "../../lib/error.js";

const giveManaSchema = z.object({
  userIds: z.array(
    z.string().regex(/^[a-zA-Z0-9]{25,32}$/, "Invalid user ID format"),
  ),
  value: z.number(),
  notify: z.boolean(),
  reason: z.string().max(40, "Reason must be at most 40 characters").optional(),
});

interface GiveManaRequest extends AuthenticatedRequest {
  body: {
    userIds: string[];
    value: number;
    notify: boolean;
    reason: string;
  };
}

export const adminGiveMana = [
  requireAdmin,
  validateBody(giveManaSchema),
  async (req: GiveManaRequest, res: Response) => {
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
          select: {
            id: true,
            username: true,
          },
        });

        await Promise.all(
          users.map(async (user) => {
            const manaToGive = await manaValidator(tx, user.id, value);

            await tx.user.update({
              where: {
                id: user.id,
              },
              data: {
                mana: { increment: manaToGive },
              },
            });

            await addLog(
              tx,
              user.id,
              `${user.username} received ${manaToGive} mana from GM ${username}. ${reason}`,
            );
          }),
        );

        return users.map((u) => u.username);
      });

      if (notify && usernames.length > 0) {
        await sendDiscordMessage(
          username,
          "Mana from the Game Masters",
          `User(s) ${usernames.join(", ")} has been given ${value} mana. ${reason}`,
        );
      }

      res.json({
        success: true,
        data: {
          message: `${value} mana given successfully to ${userIds.length} users.`,
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

      logger.error("A game master failed to give mana to users: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to give mana",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
