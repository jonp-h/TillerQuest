"use server";

import { auth } from "@/auth";
import { getMembersByCurrentUserGuild } from "@/data/user/getGuildmembers";
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
  const session = await auth();
  if (session?.user?.id !== user.id) {
    throw new Error("Not authorized");
  }

  // check if user has enough gemstones
  if (user.gemstones < 0) {
    throw new Error("Insufficient gemstones");
  }

  try {
    return db.$transaction(async (db) => {
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

      //TODO: double check improvements to other targeting passives?
      // check if ability is a self-targeting ability with upgrades
      if (ability.target === -1) {
        // user can only have one passive of each type (mana, health, xp)
        // delete the old one, before adding the upgraded version
        const parentPassive = await db.userPassive.findFirst({
          where: {
            userId: user.id,
            abilityName: ability.parentAbility ?? "",
          },
          select: {
            id: true,
            effectType: true,
            value: true,
          },
        });

        if (parentPassive) {
          await db.userPassive.delete({
            where: {
              id: parentPassive?.id,
            },
          });
        }

        // check if the passive has increased health or mana, if so decrement the old value
        if (parentPassive?.effectType === "IncreaseHealth") {
          await db.user.update({
            where: {
              id: user.id,
            },
            data: {
              hpMax: {
                decrement: parentPassive.value ?? 0,
              },
            },
          });
        } else if (parentPassive?.effectType === "IncreaseMana") {
          await db.user.update({
            where: {
              id: user.id,
            },
            data: {
              manaMax: {
                decrement: parentPassive.value ?? 0,
              },
            },
          });
        }
      }
      logger.info(`User ${user.id} bought ability ${ability.name}`);
      return "Bought " + ability.name + " successfully!";
    });
  } catch (error) {
    logger.error(
      `Error buying ability ${ability.name} by user ${user.username}: ${error}`,
    );
    return (
      "Something went wrong. Please notify a game master of this timestamp: " +
      Date.now()
    );
  }
};
