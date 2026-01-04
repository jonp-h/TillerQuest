import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAuth, requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import z from "zod";
import { validateBody } from "../../middleware/validationMiddleware.js";
import { healingValidator } from "../../utils/abilities/abilityValidators.js";
import { addLog } from "../../utils/logs/addLog.js";
import { sendDiscordMessage } from "../../lib/discord.js";
import { ErrorMessage } from "../../lib/error.js";

const healUsersSchema = z.object({
  userIds: z.array(z.cuid()),
  value: z.number().positive("Healing value must be positive"),
  notify: z.boolean(),
  reason: z.string().max(40, "Reason must be at most 40 characters"),
});

interface HealUsersRequest extends AuthenticatedRequest {
  body: {
    userIds: string[];
    value: number;
    notify: boolean;
    reason: string;
  };
}

export const adminHealUsers = [
  requireAuth,
  requireAdmin,
  validateBody(healUsersSchema),
  async (req: HealUsersRequest, res: Response) => {
    try {
      const { userIds, value, notify, reason } = req.body;
      const username = req.session!.user.username || "Admin";

      const result = await db.$transaction(async (tx) => {
        const healedUsers: string[] = [];

        await Promise.all(
          userIds.map(async (userId) => {
            const valueToHeal = await healingValidator(tx, userId, value);

            if (typeof valueToHeal === "number" && valueToHeal !== 0) {
              const targetUser = await tx.user.update({
                where: {
                  id: userId,
                },
                select: {
                  username: true,
                },
                data: {
                  hp: { increment: valueToHeal },
                },
              });

              healedUsers.push(targetUser.username ?? "Hidden");
              logger.info(
                `A game master healed user ${targetUser.username} for ${valueToHeal}`,
              );

              await addLog(
                tx,
                userId,
                `${targetUser.username} was healed for ${valueToHeal} HP by GM ${username}. ${reason}`,
              );
            } else {
              logger.info(
                `Healing failed for user ${userId} with an attempt to do: ${valueToHeal}`,
              );
            }
          }),
        );

        if (notify && healedUsers.length > 0) {
          await sendDiscordMessage(
            username,
            "Healing from the Game Masters",
            `User(s) ${healedUsers.join(", ")} has been healed for ${value} HP. ${reason}`,
          );
        }

        return healedUsers;
      });

      res.json({
        success: true,
        data: {
          message: `${value} health given to ${userIds.length} users. The dead are not healed`,
          healedUsers: result,
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

      logger.error("A game master failed to heal users: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to heal users",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
