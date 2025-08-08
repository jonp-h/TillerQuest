import { damageValidator } from "data/validators.js";
import { PrismaTransaction } from "./types/prismaTransaction.js";

export const randomCosmic = async (db: PrismaTransaction) => {
  try {
    // const now = new Date();
    // const today = now.toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format

    await db.cosmicEvent.updateMany({
      where: {
        OR: [{ recommended: true }, { selected: true }],
      },
      data: {
        recommended: false,
        selected: false,
      },
    });

    let cosmic;
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
      const weight = event.frequency / 100 / (event.occurrences + 1);
      return { event, weight };
    });

    // Normalize weights to sum up to 1
    const totalWeight = weights.reduce((sum, { weight }) => sum + weight, 0);
    const normalizedWeights = weights.map(({ event, weight }) => ({
      event,
      weight: weight / totalWeight,
    }));

    // Select an event based on normalized weights
    let randomValue = Math.random();

    for (const { event, weight } of normalizedWeights) {
      if (randomValue < weight) {
        cosmic = event;
        break;
      }
      randomValue -= weight;
    }

    // Fallback in case no event is selected (should not happen)
    if (!cosmic) {
      cosmic = events[0];
    }

    await db.cosmicEvent.update({
      where: {
        name: cosmic.name,
      },
      data: {
        recommended: true,
      },
    });

    return cosmic;
  } catch (error) {
    console.error("Unable to get random cosmic:", error);
    throw new Error("Unable to get random cosmic");
  }
};

export const weeklyGuildReset = async (db: PrismaTransaction) => {
  const guilds = await db.guild.findMany({
    where: {
      archived: false,
      members: {
        some: {}, // Ensures at least one member exists
      },
    },
    select: {
      name: true,
      nextGuildLeader: true,
      members: {
        select: {
          id: true,
        },
        orderBy: {
          id: "asc",
        },
      },
    },
  });

  for (const guild of guilds) {
    // next guild leader is the next member in the list
    const nextGuildLeaderIndex =
      guild.members.findIndex((member) => member.id === guild.nextGuildLeader) +
      1;

    await db.guild.update({
      where: {
        name: guild.name,
      },
      data: {
        guildLeader: guild.nextGuildLeader || guild.members[0].id,
        nextGuildLeader:
          nextGuildLeaderIndex < guild.members.length
            ? guild.members[nextGuildLeaderIndex].id
            : guild.members[0].id,
      },
    });
  }

  return guilds;
};

export const triggerGuildEnemyDamage = async (db: PrismaTransaction) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const guildEnemies = await db.guildEnemy.findMany({
    where: { health: { gt: 0 } },
    select: {
      guildName: true,
      name: true,
      attack: true,
    },
  });

  // Sum attack per guild for analytics
  const guildAttackTotals = guildEnemies.reduce<Record<string, number>>(
    (acc, enemy) => {
      acc[enemy.guildName] = (acc[enemy.guildName] || 0) + enemy.attack;
      return acc;
    },
    {},
  );

  // Add sum to analytics
  await Promise.all(
    Object.entries(guildAttackTotals).map(([guildName, totalAttack]) =>
      db.analytics.create({
        data: {
          triggerType: "dungeon_damage",
          guildName,
          value: totalAttack,
        },
      }),
    ),
  );

  // Damage each user in the guilds with active enemies. Only target users who have been active today.
  for (const enemy of guildEnemies) {
    const users = await db.user.findMany({
      where: {
        guildName: enemy.guildName,
        // TODO: consider removing manafetching safeguard
        lastMana: { gte: startOfToday },
      },
      select: { id: true, username: true },
    });

    await Promise.all(
      users.map(async (user) => {
        const damageToTake = await damageValidator(db, user.id, enemy.attack);
        await db.user.update({
          where: { id: user.id },
          data: { hp: { decrement: damageToTake } },
        });
        await db.log.create({
          data: {
            global: false,
            userId: user.id,
            message: `${user.username} took ${damageToTake} damage when fighting alongside their guildmates in the dungeon.`,
          },
        });
      }),
    );
  }
};
