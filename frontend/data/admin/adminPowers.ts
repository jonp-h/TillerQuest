"use server";

import { db } from "@/lib/db";
import {
  damageValidator,
  healingValidator,
  manaValidator,
} from "../validators/validators";
import { logger } from "@/lib/logger";
import { User } from "@prisma/client";
import { getUserPassiveEffect } from "../passives/getPassive";
import { gemstonesOnLevelUp } from "@/lib/gameSetting";

export const healUsers = async (users: { id: string }[], value: number) => {
  try {
    return await db.$transaction(async (db) => {
      await Promise.all(
        users.map(async (user) => {
          let valueToHeal = await healingValidator(db, user.id, value);

          if (typeof valueToHeal === "number" && valueToHeal !== 0) {
            await db.user.update({
              where: {
                id: user.id,
              },
              data: {
                hp: { increment: valueToHeal },
              },
            });
            logger.info(
              "A game master healed user " + user.id + " for " + valueToHeal,
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
    });
    return "Healing successful. The dead are not healed";
  } catch (error) {
    logger.error("A game master failed to heal users: " + error);
    return "Something went wrong at " + Date.now() + " with error: " + error;
  }
};

export const damageUsers = async (users: { id: string }[], value: number) => {
  try {
    return await db.$transaction(async (db) => {
      await Promise.all(
        users.map(async (user) => {
          const targetHP = await db.user.findFirst({
            where: {
              id: user.id,
            },
            select: { hp: true },
          });

          let valueToDamage = await damageValidator(
            db,
            user.id,
            targetHP!.hp,
            value,
          );

          await db.user.update({
            where: {
              id: user.id,
            },
            data: {
              hp: { decrement: valueToDamage },
            },
          });
        }),
      );
      return "Damage successful";
    });
  } catch (error) {
    logger.error("A game master failed to heal users: " + error);
    return "Something went wrong at " + Date.now() + " with error: " + error;
  }
};

/**
 * Gives XP to multiple users, without setting the last mana date.
 * @param users - An array of User objects.
 * @param xp - The amount of XP to give to each user.
 * @returns A string indicating the result of the operation.
 */
export const giveXpToUsers = async (users: User[], xp: number) => {
  try {
    return await db.$transaction(async (db) => {
      await Promise.all(
        users.map(async (user) => {
          const xpMultipler = await getUserPassiveEffect(
            db,
            user.id,
            "Experience",
          );
          const xpToGive = Math.round(xp * (xpMultipler + 1));
          const levelDifference =
            Math.floor(user.xp + xpToGive / 1000) + 1 - user.level;

          await db.user.update({
            where: { id: user.id },
            data: {
              xp: { increment: xpToGive },
              ...(levelDifference > 0
                ? {
                    level: { increment: levelDifference },
                    gemstones: {
                      increment: gemstonesOnLevelUp * levelDifference,
                    },
                  }
                : {}),
            },
          });
          levelDifference > 0 &&
            logger.info(
              `LEVEL UP: User ${user.id} leveled up to level ${user.level}`,
            );
        }),
      );
      return "Successfully gave XP to users";
    });
  } catch (error) {
    logger.error("A game master failed to give XP to users: " + error);
    return "Something went wrong at " + Date.now() + " with error: " + error;
  }
};

export const giveManaToUsers = async (users: User[], mana: number) => {
  try {
    return await db.$transaction(async (db) => {
      await Promise.all(
        users.map(async (user) => {
          // Validate the mana amount to give
          let manaToGive = await manaValidator(db, user.id, mana);

          // If the validator returns a string, return the error message
          if (typeof manaToGive === "string" || manaToGive === 0) {
            return manaToGive;
          }

          await db.user.update({
            where: {
              id: user.id,
            },
            data: {
              mana: { increment: manaToGive },
            },
          });
        }),
      );
      return "Mana given successfully";
    });
  } catch (error) {
    logger.error("A game master failed to give mana to users: " + error);
    return "Something went wrong at " + Date.now() + " with error: " + error;
  }
};
