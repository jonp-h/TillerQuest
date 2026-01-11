import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAuth, requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import z from "zod";
import { validateBody } from "../../middleware/validationMiddleware.js";
import { damageValidator } from "../../utils/abilities/abilityValidators.js";
import { addLog } from "../../utils/logs/addLog.js";
import { sendDiscordMessage } from "../../lib/discord.js";
import { ErrorMessage } from "../../lib/error.js";

const damageUsersSchema = z.object({
  userIds: z.array(
    z.string().regex(/^[a-zA-Z0-9]{32}$/, "Invalid user ID format"),
  ),
  value: z.number().positive("Damage value must be positive"),
  notify: z.boolean(),
  reason: z.string().max(40, "Reason must be at most 40 characters").optional(),
});

interface DamageUsersRequest extends AuthenticatedRequest {
  body: {
    userIds: string[];
    value: number;
    notify: boolean;
    reason: string;
  };
}

export const adminDamageUsers = [
  requireAuth,
  requireAdmin,
  validateBody(damageUsersSchema),
  async (req: DamageUsersRequest, res: Response) => {
    try {
      const { userIds, value, notify, reason } = req.body;
      const username = req.session!.user.username || "Admin";

      const result = await db.$transaction(async (tx) => {
        const damagedUsers: string[] = [];

        await Promise.all(
          userIds.map(async (userId) => {
            const targetUser = await tx.user.findFirst({
              where: {
                id: userId,
              },
              select: { hp: true, class: true },
            });

            if (!targetUser) {
              throw new ErrorMessage(`User with ID ${userId} not found`);
            }

            const valueToDamage = await damageValidator(
              tx,
              userId,
              targetUser.hp,
              value,
              targetUser?.class,
            );

            const updatedUser = await tx.user.update({
              where: {
                id: userId,
              },
              data: {
                hp: { decrement: valueToDamage },
              },
              select: {
                username: true,
                hp: true,
              },
            });
            damagedUsers.push(updatedUser.username ?? "Hidden");

            await addLog(
              tx,
              userId,
              `${updatedUser.username} was damaged for ${valueToDamage} HP by GM ${username}. ${reason}`,
            );

            if (updatedUser.hp === 0) {
              logger.info("DEATH: User " + updatedUser.username + " died.");
              await addLog(tx, userId, `DEATH: ${updatedUser.username} died.`);
            }
          }),
        );

        if (notify && damagedUsers.length > 0) {
          await sendDiscordMessage(
            username,
            "Damage from the Game Masters",
            `User ${damagedUsers.join(", ")} has been damaged for ${value} HP. ${reason}`,
          );
        }

        return damagedUsers;
      });

      res.json({
        success: true,
        data: {
          message: `${value} damage given to ${userIds.length} users.`,
          damagedUsers: result,
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

      logger.error("A game master failed to damage users: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to damage users",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
