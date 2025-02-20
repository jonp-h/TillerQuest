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
  userIds: string[],
  ability: Ability,
) => {
  try {
    return await Promise.all(
      userIds.map(async (userId) => {
        let targetHasPassive = await db.userPassive.findFirst({
          where: {
            userId: userId,
            abilityName: ability.name,
          },
        });

        if (targetHasPassive) {
          return "Target already has this passive";
        }

        // return db.$transaction(async (db) => {
        // if the ability duration is undefined, create a counter from the current time for 600000ms (10 minutes)
        await db.userPassive.create({
          data: {
            userId: userId,
            effectType: ability.type,
            passiveName: ability.name,
            icon: ability.icon,
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
              id: userId,
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
              id: userId,
            },
            data: {
              manaMax: {
                increment: ability.value ?? 0,
              },
            },
          });
        }
        return "Activated " + ability.name + "!";
      }),
    );
  } catch (error) {
    logger.error(
      "Error trying to use passive " + ability.name,
      "for users " + userIds,
      ": " + error,
    );
    return (
      "Something went wrong. Please notify a game master of this timestamp: " +
      Date.now()
    );
  }
};
