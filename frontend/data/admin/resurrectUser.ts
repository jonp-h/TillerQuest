"use server";

import { db } from "@/lib/db";
import {
  minResurrectionHP,
  guildmemberResurrectionDamage,
} from "@/lib/gameSetting";
import { getMembersByCurrentUserGuild } from "../user/getGuildmembers";
import { damageValidator } from "../validators/validators";
import { auth } from "@/auth";
import { logger } from "@/lib/logger";
import { PrismaTransaction } from "@/types/prismaTransaction";
import { addLog } from "../log/addLog";

//FIXME: requires updates from oldData
export const resurrectUsers = async ({
  userId,
  effect,
}: {
  userId: string;
  effect: string;
}) => {
  const session = await auth();
  if (!session || session?.user.role !== "ADMIN") {
    throw new Error("Not authorized");
  }

  try {
    await db.$transaction(async (db) => {
      // if the effect is free, the user will be resurrected without any consequences
      if (effect === "free") {
        await db.user.update({
          data: {
            hp: minResurrectionHP,
          },
          where: {
            id: userId,
          },
        });

        return "The resurrection was successful";
      }

      switch (effect) {
        case "criticalMiss":
          await resurrectUser(db, userId, [
            "Phone-loss",
            "Reduced-xp-gain",
            "Hat-of-shame",
            "Pop-quiz",
          ]);
          break;
        case "phone":
          await resurrectUser(db, userId, ["Phone-loss"]);
          break;
        case "xp":
          await resurrectUser(db, userId, ["Reduced-xp-gain"]);
          break;
        case "hat":
          await resurrectUser(db, userId, ["Hat-of-shame"]);
          break;
        case "quiz":
          await resurrectUser(db, userId, ["Pop-quiz"]);
          break;
        case "criticalHit":
          await resurrectUser(db, userId, []);
          break;
      }
    });
    return "The resurrection was successful, but it took it's toll on the guild. All members of the guild have been damaged.";
  } catch (error) {
    logger.error("Error resurrecting user" + error);
    return "Something went wrong with " + error;
  }
};

// resurrection by the game masters
const resurrectUser = async (
  db: PrismaTransaction,
  userId: string,
  effects: string[],
) => {
  const user = await db.user.update({
    data: {
      hp: minResurrectionHP,
    },
    where: {
      id: userId,
    },
    select: { username: true, guildName: true },
  });

  if (user.guildName) {
    // get all guildmembers and remove the resurrected user from the guildmembers array
    const guildMembers = await getMembersByCurrentUserGuild(
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

        await db.userPassive.create({
          data: {
            userId: member.id,
            passiveName: "Sacrifice",
            icon: "Sacrifice.png",
            endTime: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
            effectType: "Deathsave",
          },
        });

        await db.user.update({
          where: {
            id: member.id,
          },
          data: {
            hp: { decrement: damageToTake },
          },
        });

        await addLog(
          db,
          member.id,
          `${member.username} helped resurrect ${user.username}, and sacrificed ${damageToTake} HP in the ritual.`,
        );
      }) || [],
    );
  }
  await Promise.all(
    // if the effect array is empty, none will be added
    effects.map(async (effect) => {
      try {
        if (effect === "Reduced-xp-gain") {
          await db.userPassive.create({
            data: {
              userId: userId,
              passiveName: effect,
              icon: effect + ".png",
              endTime: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
              effectType: "Experience",
              value: -50,
            },
          });
        } else {
          await db.userPassive.create({
            data: {
              userId: userId,
              passiveName: effect,
              icon: effect + ".png",
              endTime: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
              effectType: "Deathsave",
            },
          });
        }
        await addLog(
          db,
          userId,
          `${user.username} was resurrected, but was affected by ${effect.replace(/-/g, " ")}.`,
        );
      } catch (error) {
        logger.error("Error resurrecting user" + error);
        return "Something went wrong with" + error;
      }
    }),
  );
};
