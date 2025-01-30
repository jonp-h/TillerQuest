"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { logger } from "@/lib/logger";
import { getMembersByCurrentUserGuild } from "../user/getGuildmembers";
import { User } from "@prisma/client";
import { Ability } from "@prisma/client";
import { PrismaTransaction } from "@/types/prismaTransaction";

export const usePassive = async (
  db: PrismaTransaction,
  user: User,
  ability: Ability,
) => {
  const session = await auth();
  if (session?.user?.id !== user.id) {
    throw new Error("Not authorized");
  }
  //FIXME: remove this. use existing target logic
  try {
    // return db.$transaction(async (db) => {
    // if the ability duration is undefined, create a counter from the current time for 600000ms (10 minutes)
    await db.userPassive.create({
      data: {
        userId: user.id,
        effectType: ability.type,
        abilityName: ability.name,
        value: ability.value ?? 0,
        endTime: ability.duration
          ? new Date(Date.now() + ability.duration * 60000).toISOString()
          : undefined, // 1 * 60000 = 1 minute
      },
    });

    //TODO: DRY
    if (ability.type === "IncreaseHealth") {
      await db.user.update({
        where: {
          id: user.id,
        },
        data: {
          hpMax: {
            increment: ability.value ?? 0,
          },
        },
      });
    } else if (ability.type === "IncreaseMana") {
      await db.user.update({
        where: {
          id: user.id,
        },
        data: {
          manaMax: {
            increment: ability.value ?? 0,
          },
        },
      });
    }

    // if the ability is aoe, all guildmembers should also recieve the passive
    if (ability.target === 0) {
      let guildmembers =
        (await getMembersByCurrentUserGuild(user.guildName || "")) || [];

      // Remove the user from the guildmembers list
      guildmembers = guildmembers.filter((member) => member.id !== user.id);

      await db.userPassive.createMany({
        data: guildmembers.map((member) => ({
          userId: member.id,
          effectType: ability.type,
          abilityName: ability.name,
          value: ability.value ?? 0,
          endTime: ability.duration
            ? new Date(Date.now() + ability.duration * 60000).toISOString()
            : undefined, // 1 * 60000 = 1 minute
        })),
      });

      // Check if the passive also increases stats
      if (ability.type === "IncreaseHealth") {
        await db.user.updateMany({
          data: guildmembers.map((member) => {
            return {
              where: {
                id: member.id,
              },
              data: {
                hpMax: {
                  increment: ability.value ?? 0,
                },
              },
            };
          }),
        });
      } else if (ability.type === "IncreaseMana") {
        await db.user.updateMany({
          data: guildmembers.map((member) => {
            return {
              where: {
                id: member.id,
              },
              data: {
                manaMax: {
                  increment: ability.value ?? 0,
                },
              },
            };
          }),
        });
      }
    }
    return "Activated " + ability.name + "!";
    // });
  } catch (error) {
    logger.error(
      "Error trying to use passive " + ability.name,
      "for user " + user.username,
      ": " + error,
    );
    return (
      "Something went wrong. Please notify a game master of this timestamp: " +
      Date.now()
    );
  }
};
