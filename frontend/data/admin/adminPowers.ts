"use server";

import { db } from "@/lib/db";
import {
  damageValidator,
  experienceAndLevelValidator,
  healingValidator,
  manaValidator,
} from "../validators/validators";
import { logger } from "@/lib/logger";
import { User } from "@prisma/client";
import { sendDiscordMessage } from "@/lib/discord";
import { addLog } from "../log/addLog";
import { AuthorizationError, validateAdminAuth } from "@/lib/authUtils";
import { ErrorMessage } from "@/lib/error";
import { ServerActionResult } from "@/types/serverActionResult";
import { adminReasonValidation } from "../validators/adminReasonValidation";

export const healUsers = async (
  users: { id: string }[],
  value: number,
  notify: boolean,
  reason: string,
): Promise<ServerActionResult> => {
  try {
    await validateAdminAuth();

    if (value <= 0) {
      throw new ErrorMessage("Healing value must be greater than 0");
    }

    const validatedReason = await adminReasonValidation(reason);

    if (!validatedReason.success) {
      throw new ErrorMessage(validatedReason.error);
    }
    reason = validatedReason.data;

    return await db.$transaction(async (db) => {
      const healedUsers: string[] = [];
      await Promise.all(
        users.map(async (user) => {
          const valueToHeal = await healingValidator(db, user.id, value);

          if (typeof valueToHeal === "number" && valueToHeal !== 0) {
            const targetUser = await db.user.update({
              where: {
                id: user.id,
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
              "A game master healed user " +
                targetUser.username +
                " for " +
                valueToHeal,
            );

            await addLog(
              db,
              user.id,
              `${targetUser.username} was healed for ${valueToHeal} HP. ${reason}`,
            );
          } else {
            logger.info(
              "Healing failed for user " +
                user.id +
                " with an attempt to do: " +
                valueToHeal,
            );
          }
        }),
      );

      if (notify)
        await sendDiscordMessage(
          "Game Master",
          `User(s) ${healedUsers.map((user) => user).join(", ")} has been healed for ${value} HP. ${reason}`,
        );
      return {
        success: true,
        data:
          value +
          " health given to " +
          users.length +
          " users. The dead are not healed",
      };
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized admin action attempt: " + error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    if (error instanceof ErrorMessage) {
      return {
        success: false,
        error: error.message,
      };
    }

    logger.error("A game master failed to heal users: " + error);
    return {
      success: false,
      error:
        "Something went wrong. Error timestamp: " +
        Date.now().toLocaleString("no-NO"),
    };
  }
};

export const damageUsers = async (
  users: { id: string }[],
  value: number,
  notify: boolean,
  reason: string,
): Promise<ServerActionResult> => {
  try {
    await validateAdminAuth();

    if (value <= 0) {
      throw new ErrorMessage("Damage value must be greater than 0");
    }

    const validatedReason = await adminReasonValidation(reason);

    if (!validatedReason.success) {
      throw new ErrorMessage(validatedReason.error);
    }
    reason = validatedReason.data;

    return await db.$transaction(async (db) => {
      const damagedUsers: string[] = [];
      await Promise.all(
        users.map(async (user) => {
          const targetUser = await db.user.findFirst({
            where: {
              id: user.id,
            },
            select: { hp: true, class: true },
          });

          if (!targetUser) {
            throw new ErrorMessage(`User with ID ${user.id} not found`);
          }

          const valueToDamage = await damageValidator(
            db,
            user.id,
            targetUser.hp,
            value,
            targetUser?.class,
          );

          const updatedUser = await db.user.update({
            where: {
              id: user.id,
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
            db,
            user.id,
            `${updatedUser.username} was damaged for ${valueToDamage} HP. ${reason}`,
          );
          if (updatedUser.hp === 0) {
            logger.info("DEATH: User " + updatedUser.username + " died.");
            await addLog(db, user.id, `DEATH: ${updatedUser.username} died.`);
          }
        }),
      );
      if (notify)
        await sendDiscordMessage(
          "Game Master",
          `User ${damagedUsers.map((user) => user).join(", ")} has been damaged for ${value} HP. ${reason}`,
        );
      return {
        success: true,
        data: value + " damage given to " + users.length + " users.",
      };
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized admin action attempt: " + error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    if (error instanceof ErrorMessage) {
      return {
        success: false,
        error: error.message,
      };
    }

    logger.error("A game master failed to damage users: " + error);
    return {
      success: false,
      error:
        "Something went wrong. Error timestamp: " +
        Date.now().toLocaleString("no-NO"),
    };
  }
};

/**
 * Gives XP to multiple users, without setting the last mana date.
 * @param users - An array of User objects.
 * @param xp - The amount of XP to give to each user.
 * @returns A string indicating the result of the operation.
 */
export const giveXpToUsers = async (
  // FIXME: strings
  users: User[],
  xp: number,
  notify: boolean,
  reason: string,
): Promise<ServerActionResult> => {
  try {
    await validateAdminAuth();

    const validatedReason = await adminReasonValidation(reason);

    if (!validatedReason.success) {
      throw new ErrorMessage(validatedReason.error);
    }
    reason = validatedReason.data;

    return await db.$transaction(async (db) => {
      await Promise.all(
        users.map(async (user) => {
          await experienceAndLevelValidator(db, user, xp, reason);
        }),
      );
      if (notify)
        await sendDiscordMessage(
          "Game Master",
          `User(s) ${users.map((user) => user.username).join(", ")} has been given ${xp} XP. ${reason}`,
        );
      return {
        success: true,
        data: xp + " XP given successfully to " + users.length + " users.",
      };
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized admin action attempt: " + error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    if (error instanceof ErrorMessage) {
      return {
        success: false,
        error: error.message,
      };
    }

    logger.error("A game master failed to give XP to users: " + error);
    return {
      success: false,
      error:
        "Something went wrong. Error timestamp: " +
        Date.now().toLocaleString("no-NO"),
    };
  }
};

export const giveManaToUsers = async (
  // FIXME: strings
  users: User[],
  mana: number,
  notify: boolean,
  reason: string,
): Promise<ServerActionResult> => {
  try {
    await validateAdminAuth();

    const validatedReason = await adminReasonValidation(reason);

    if (!validatedReason.success) {
      throw new ErrorMessage(validatedReason.error);
    }
    reason = validatedReason.data;

    return await db.$transaction(async (db) => {
      await Promise.all(
        users.map(async (user) => {
          // Validate the mana amount to give
          const manaToGive = await manaValidator(db, user.id, mana);

          await db.user.update({
            where: {
              id: user.id,
            },
            data: {
              mana: { increment: manaToGive },
            },
          });

          await addLog(
            db,
            user.id,
            `${user.username} recieved ${manaToGive} mana. ${reason}`,
          );
        }),
      );
      if (notify)
        await sendDiscordMessage(
          "Game Master",
          `User(s) ${users.map((user) => user.username).join(", ")} has been given ${mana} mana. ${reason}`,
        );
      return {
        success: true,
        data: mana + " mana given successfully to " + users.length + " users.",
      };
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized admin action attempt: " + error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    if (error instanceof ErrorMessage) {
      return {
        success: false,
        error: error.message,
      };
    }

    logger.error("A game master failed to give mana to users: " + error);
    return {
      success: false,
      error:
        "Something went wrong. Error timestamp: " +
        Date.now().toLocaleString("no-NO"),
    };
  }
};

export const giveArenatokenToUsers = async (
  // FIXME: strings
  users: User[],
  arenatoken: number,
  notify: boolean,
  reason: string,
): Promise<ServerActionResult> => {
  try {
    await validateAdminAuth();

    const validatedReason = await adminReasonValidation(reason);

    if (!validatedReason.success) {
      throw new ErrorMessage(validatedReason.error);
    }
    reason = validatedReason.data;

    return await db.$transaction(async (db) => {
      await Promise.all(
        users.map(async (user) => {
          await db.user.update({
            where: {
              id: user.id,
            },
            data: {
              arenaTokens: { increment: arenatoken },
            },
          });

          await addLog(
            db,
            user.id,
            `${user.username} recieved ${arenatoken} arenatokens. ${reason}`,
          );
        }),
      );
      if (notify)
        await sendDiscordMessage(
          "Game Master",
          `User(s) ${users.map((user) => user.username).join(", ")} has been given ${arenatoken} arenatokens. ${reason}`,
        );
      return {
        success: true,
        data:
          arenatoken +
          " arenatokens given successfully to " +
          users.length +
          " users.",
      };
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized admin action attempt: " + error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    if (error instanceof ErrorMessage) {
      return {
        success: false,
        error: error.message,
      };
    }

    logger.error("A game master failed to give arenatokens to users: " + error);
    return {
      success: false,
      error:
        "Something went wrong. Error timestamp: " +
        Date.now().toLocaleString("no-NO"),
    };
  }
};

export const giveGoldToUsers = async (
  // FIXME: strings
  users: User[],
  gold: number,
  notify: boolean,
  reason: string,
): Promise<ServerActionResult> => {
  try {
    await validateAdminAuth();

    const validatedReason = await adminReasonValidation(reason);

    if (!validatedReason.success) {
      throw new ErrorMessage(validatedReason.error);
    }
    reason = validatedReason.data;

    return await db.$transaction(async (db) => {
      await Promise.all(
        users.map(async (user) => {
          await db.user.update({
            where: {
              id: user.id,
            },
            data: {
              gold: { increment: gold },
            },
          });

          await addLog(
            db,
            user.id,
            `${user.username} recieved ${gold} gold. ${reason}`,
          );
        }),
      );
      if (notify)
        await sendDiscordMessage(
          "Game Master",
          `User(s) ${users.map((user) => user.username).join(", ")} has been given ${gold} gold. ${reason}`,
        );
      return {
        success: true,
        data: gold + " gold given successfully to " + users.length + " users.",
      };
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized admin action attempt: " + error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    if (error instanceof ErrorMessage) {
      return {
        success: false,
        error: error.message,
      };
    }

    logger.error("A game master failed to give gold to users: " + error);
    return {
      success: false,
      error:
        "Something went wrong. Error timestamp: " +
        Date.now().toLocaleString("no-NO"),
    };
  }
};
