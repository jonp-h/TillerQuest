"use server";

import { db } from "@/lib/db";
import {
  minResurrectionHP,
  guildmemberResurrectionDamage,
} from "@/lib/gameSetting";
import { AbilityType } from "@prisma/client";
import { getMembersByCurrentUserGuild } from "../user/getGuildmembers";
import { damageValidator } from "../validators/validators";

//FIXME: requires updates from oldData
export const resurrectUsers = async ({
  userId,
  effect,
}: {
  userId: string;
  effect: string;
}) => {
  try {
    // if the effect is free, the user will be resurrected without any consequences
    if (effect === "free") {
      await db.$transaction(async (db) => {
        const user = await db.user.update({
          data: {
            hp: minResurrectionHP,
          },
          where: {
            id: userId,
          },
        });
      });
      return "The resurrection was successful";
    }

    switch (effect) {
      case "criticalMiss":
        await resurrectUser(userId, [
          "Phone-loss",
          "Reduced-xp-gain",
          "Hat-of-shame",
          "Sudden-pop-quiz",
        ]);
        break;
      case "phone":
        await resurrectUser(userId, ["Phone-loss"]);
        break;
      case "xp":
        await resurrectUser(userId, ["Reduced-xp-gain"]);
        break;
      case "hat":
        await resurrectUser(userId, ["Hat-of-shame"]);
        break;
      case "quiz":
        await resurrectUser(userId, ["Sudden-pop-quiz"]);
        break;
      case "criticalHit":
        await resurrectUser(userId, []);
        break;
    }
    return "The resurrection was successful, but it took it's toll on the guild. All members of the guild have been damaged.";
  } catch (error) {
    console.error("Error resurrecting user" + error);
    return "Something went wrong with " + error;
  }
};

// resurrection by the game masters
const resurrectUser = async (userId: string, effects: string[]) => {
  await db.$transaction(async (db) => {
    const user = await db.user.update({
      data: {
        hp: minResurrectionHP,
      },
      where: {
        id: userId,
      },
      select: { guildName: true },
    });

    if (user.guildName) {
      // get all guildmembers and remove the resurrected user from the guildmembers array
      let guildMembers = await getMembersByCurrentUserGuild(
        user.guildName,
      ).then((member) => member!.filter((member) => member.id !== userId));

      await Promise.all(
        guildMembers?.map(async (member) => {
          const damageToTake = await damageValidator(
            db,
            member.id,
            member.hp,
            guildmemberResurrectionDamage,
            minResurrectionHP,
          );

          return db.user.update({
            where: {
              id: member.id,
            },
            data: {
              hp: { decrement: damageToTake },
            },
          });
        }) || [],
      );
    }
    await Promise.all(
      // if the effect array is empty, none will be added
      effects.map(async (effect) => {
        try {
          console.log(effect);
          await db.userPassive.create({
            data: {
              userId: userId,
              abilityName: effect,
              endTime: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
              effectType: "Deathsave" as AbilityType,
            },
          });
        } catch (error) {
          console.error("Error resurrecting user" + error);
          return "Something went wrong with" + error;
        }
      }),
    );
  });
};
