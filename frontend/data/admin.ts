"use server";
import { db } from "@/lib/db";
import { User } from "@prisma/client";
import { checkLevelUp, checkMana, resurrectUser } from "./helpers";
import { minResurrectionHP } from "@/lib/gameSetting";
import { damageValidator, healingValidator } from "./helpers";

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

        let valueToHeal = await healingValidator(
          targetHP!.hp,
          value,
          targetHP!.hpMax,
        );

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
      }),
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

        let valueToDamage = await damageValidator(targetHP!.hp, value, 0);

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
      }),
    );
    return "Mana given successful";
  } catch (error) {
    console.error("Error giving mana to users" + error);
    return "Something went wrong with" + error;
  }
};

// ------------------- Cosmic -------------------

export const randomCosmic = async () => {
  try {
    const now = new Date();
    const today = now.toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format

    return await db.$transaction(async (db) => {
      //TODO: Implement preset events
      // Check for events with date equal to the current date
      // const presetEvents = await db.cosmicEvent.findFirst({
      //   where: {
      //     presetDate: today,
      //   },
      // });

      // if (presetEvents) {
      //   return presetEvents;
      // }

      // Get all events
      const events = await db.cosmicEvent.findMany();

      if (events.length === 0) {
        throw new Error("No events available");
      }

      // Calculate weights based on frequency and occurrences
      const weights = events.map((event) => {
        const weight = event.frequency / (event.occurrences + 1);
        return { event, weight };
      });

      // Calculate total weight
      const totalWeight = weights.reduce((sum, { weight }) => sum + weight, 0);

      // Select an event based on weights
      let randomValue = Math.random() * totalWeight;

      for (const { event, weight } of weights) {
        if (randomValue < weight) {
          return event;
        }
        randomValue -= weight;
      }

      // Fallback in case no event is selected (should not happen)
      return events[0];
    });
  } catch (error) {
    console.error("Unable to get random cosmic:", error);
    throw new Error("Unable to get random cosmic");
  }
};

export const setSelectedCosmic = async (cosmicName: string) => {
  try {
    return await db.$transaction(async (db) => {
      // Unselect all events
      await db.cosmicEvent.updateMany({
        where: {
          selected: true,
        },
        data: {
          selected: false,
        },
      });

      // update cosmic with 1 occurrence and set it to selected
      const cosmic = await db.cosmicEvent.update({
        where: {
          name: cosmicName,
        },
        data: {
          occurrences: {
            increment: 1,
          },
          selected: true,
        },
      });

      // add selected passive or abilities to users

      if (!cosmic) {
        throw new Error("Cosmic not found");
      }

      return cosmic;
    });
  } catch (error) {
    console.error("Unable to select cosmic:", error);
    throw new Error("Unable to select cosmic");
  }
};

export const getAllCosmicEvents = async () => {
  const cosmicEvents = await db.cosmicEvent.findMany({
    orderBy: {
      selected: "desc",
    },
  });
  return cosmicEvents;
};
