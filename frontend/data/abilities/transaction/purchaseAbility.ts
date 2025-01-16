"use server";

import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { Ability, User } from "@prisma/client";

/**
 * Buys an ability for a user.
 *
 * @param userId - The ID of the user.
 * @param ability - The ability to be bought.
 * @returns A promise that resolves to "Success" if the ability is successfully bought, or a string indicating an error if something goes wrong.
 */
export const buyAbility = async (user: User, ability: Ability) => {
  try {
    return db.$transaction(async (db) => {
      // check if user has enough gemstones
      if (user.gemstones < 0) {
        throw new Error("Insufficient gemstones");
      }

      // decrement the cost from the user's gemstones
      await db.user.update({
        where: {
          id: user.id,
        },
        data: {
          gemstones: {
            decrement: ability.gemstoneCost,
          },
        },
      });

      await db.userAbility.create({
        data: {
          userId: user.id,
          abilityName: ability.name,
        },
      });

      if (ability.isPassive) {
        // user can only have one passive of each type (mana, health, xp)
        // delete the old one, before adding the upgraded version
        const parentPassive = await db.userPassive.findFirst({
          where: {
            userId: user.id,
            abilityName: ability.parentAbility ?? "",
          },
          select: {
            id: true,
          },
        });

        if (parentPassive) {
          await db.userPassive.delete({
            where: {
              id: parentPassive?.id,
            },
          });
        }

        // if the ability duration is undefined, create a counter from the current time for 600000ms (10 minutes)
        await db.userPassive.create({
          data: {
            userId: user.id,
            effectType: ability.type,
            abilityName: ability.name,
            value: ability.value ?? 0,
            endTime: ability.duration
              ? new Date(Date.now() + ability.duration * 60000).toISOString()
              : undefined, //TODO: datetime?
          },
        });
      }
      logger.info(
        `User ${user.id} bought ability ${ability.name}` +
          (ability.isPassive ? " and activated it" : ""),
      );
      return "Success";
    });
  } catch (error) {
    logger.error(
      `Error buying ability ${ability.name} by user ${user.id}: ${error}`,
    );
    return (
      "Something went wrong. Please notify a game master of this timestamp: " +
      Date.now()
    );
  }
};
