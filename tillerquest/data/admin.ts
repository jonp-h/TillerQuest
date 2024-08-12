"use server";
import { db } from "@/lib/db";
import { User } from "@prisma/client";
import { checkLevelUp, checkMana } from "./helpers";
import {
  guildmemberResurrectionDamage,
  minResurrectionHP,
} from "@/lib/gameSetting";
import { getMembersByCurrentUserGuild } from "./user";

// ------------------ Debugging functions not used in the app ------------------

// current limitations/bug with prisma studio make the admin unable to add new records in models with many-to-many relationships
// https://github.com/prisma/studio/issues/980
export const createAbility = async () => {
  const abilityData = {
    name: "passiveTest6",
    type: "Passive",
    description: "test",
    duration: 1,
    icon: "test",
    manaCost: 2,
    gemStoneCost: 1,
    xpGiven: 1,
    value: 1,
    parents: {
      connect: [
        {
          name: "passiveTest2",
        },
        {
          name: "passiveTest3",
        },
      ],
    },
  };

  try {
    const newAbility = await db.ability.create({
      // @ts-ignore
      data: abilityData,
    });
    console.log("New ability created:", newAbility);
  } catch (error) {
    console.error("Error creating ability:", error);
    throw new Error("Unable to create ability");
  }
};

// ------------------- Game master -------------------¨

export const getAllDeadUsers = async () => {
  const deadUsers = await db.user.findMany({
    where: {
      hp: {
        equals: 0,
      },
    },
  });
  return deadUsers;
};

export const getAllUsers = async () => {
  const users = await db.user.findMany();
  return users;
};

export const resurrectUsers = async (userId: { id: string }) => {
  try {
    await db.$transaction(async (db) => {
      const user = await db.user.update({
        data: {
          hp: minResurrectionHP,
        },
        where: {
          id: userId.id,
        },
      });

      // FIXME: implement resurrection damage to all guild members
      // const guildMembers = await getMembersByCurrentUserGuild(
      //   user.guildName ?? ""
      // );
      // guildMembers?.map(async (member) => {

      //   if (member) {
      //     // Damage to apply to guild members. the guild members should not go below userReserrectionHP. the damage done is guildmemberResurrectionDamage
      //     const damageToApply = Math.min(
      //       member.hp - minResurrectionHP,
      //       guildmemberResurrectionDamage
      //     );

      //     await db.user.update({
      //       where: {
      //         id: member.id,
      //       },
      //       data: {
      //         hp: { decrement: damageToApply },
      //       },
      //     });
      //   }
      // });

      return "The resurrection was successful, but it took it's toll on the guild. All members of the guild have been damaged.";
    });
  } catch (error) {
    console.error("Error resurrecting user" + error);
    return "Something went wrong with " + error;
  }
};

export const healUsers = async (users: { id: string }[], value: number) => {
  try {
    await Promise.all(
      users.map(async (user) => {
        const targetHP = await db.user.findFirst({
          where: {
            id: user.id,
          },
          select: { hp: true, hpMax: true },
        });

        let valueToHeal = value;

        if (targetHP?.hp === 0) {
          valueToHeal = 0;
        } else if (targetHP && targetHP?.hp + value >= targetHP?.hpMax) {
          valueToHeal = targetHP?.hpMax - targetHP?.hp;
        }

        if (valueToHeal !== 0) {
          await db.user.update({
            where: {
              id: user.id,
            },
            data: {
              hp: { increment: valueToHeal },
            },
          });
        }
      })
    );
    return "Healing successful. The dead are not healed";
  } catch (error) {
    console.error("Error healing users" + error);
    return "Something went wrong with " + error;
  }
};

export const damageUsers = async (users: { id: string }[], value: number) => {
  try {
    await Promise.all(
      users.map(async (user) => {
        const targetHP = await db.user.findFirst({
          where: {
            id: user.id,
          },
          select: { hp: true, hpMax: true },
        });

        let valueToDamage = value;

        if (targetHP && targetHP?.hp - value <= 0) {
          valueToDamage = targetHP?.hp;
        }

        await db.user.update({
          where: {
            id: user.id,
          },
          data: {
            hp: { decrement: valueToDamage },
          },
        });
      })
    );
    return "Damage successful";
  } catch (error) {
    console.error("Error damaging users" + error);
    return "Something went wrong with " + error;
  }
};

/**
 * Gives XP to multiple users, without setting the last mana date.
 * @param users - An array of User objects.
 * @param xp - The amount of XP to give to each user.
 * @returns A string indicating the result of the operation.
 */
export const giveXpToUsers = async (users: User[], xp: number) => {
  // TODO: Consider the use of xp passives

  try {
    await db.user.updateMany({
      where: { id: { in: users.map((user) => user.id) } },
      data: [{ xp: { increment: xp } }],
    });

    users.map(async (user) => {
      checkLevelUp(user);
    });

    return "Successfully gave XP to users";
  } catch (error) {
    console.error(error);
    return "Something went wrong with " + error;
  }
};

export const giveManaToUsers = async (users: User[], mana: number) => {
  try {
    await Promise.all(
      users.map(async (user) => {
        // adds value and passives to mana value based on user's max mana
        let manaToGive = await checkMana(user.id, mana);

        await db.user.update({
          where: {
            id: user.id,
          },
          data: {
            mana: { increment: manaToGive },
          },
        });
      })
    );
    return "Mana given successful";
  } catch (error) {
    console.error("Error giving mana to users" + error);
    return "Something went wrong with" + error;
  }
};
