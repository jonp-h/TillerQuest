import {
  damageValidator,
  experienceAndLevelValidator,
  healingValidator,
  manaValidator,
} from "utils/abilities/abilityValidators.js";
import { PrismaTransaction } from "./types/prismaTransaction.js";

export const removePassivesWithIncreasedValues = async (
  db: PrismaTransaction,
  now: Date,
) => {
  const usersWithIncreasedHealth = await db.userPassive.findMany({
    where: {
      effectType: "IncreaseHealth",
      endTime: { lte: now },
    },
    include: {
      user: true,
    },
  });

  for (const passive of usersWithIncreasedHealth) {
    const newMaxHp = passive.user.hpMax - (passive.value || 0);
    const newHp = Math.min(passive.user.hp, newMaxHp);
    await db.user.update({
      where: { id: passive.userId },
      data: { hp: newHp, hpMax: newMaxHp },
    });
  }

  const usersWithIncreasedMana = await db.userPassive.findMany({
    where: {
      effectType: "IncreaseMana",
      endTime: { lte: now },
    },
    include: {
      user: true,
    },
  });

  for (const passive of usersWithIncreasedMana) {
    const newMaxMana = passive.user.manaMax - (passive.value || 0);
    const newMana = Math.min(passive.user.mana, newMaxMana);
    await db.user.update({
      where: { id: passive.userId },
      data: { mana: newMana, manaMax: newMaxMana },
    });
  }
};

export const removePassivesWithDecreasedValues = async (
  db: PrismaTransaction,
  now: Date,
) => {
  const usersWithDecreasedHealth = await db.userPassive.findMany({
    where: {
      effectType: "DecreaseHealth",
      endTime: { lte: now },
    },
    include: {
      user: true,
    },
  });

  for (const passive of usersWithDecreasedHealth) {
    const newMaxHp = passive.user.hpMax + (passive.value || 0);
    // HP is restored up to the original value before the decrease
    const newHp = Math.min(passive.user.hp + (passive.value || 0), newMaxHp);
    await db.user.update({
      where: { id: passive.userId },
      data: { hp: newHp, hpMax: newMaxHp },
    });
  }

  const usersWithDecreasedMana = await db.userPassive.findMany({
    where: {
      effectType: "DecreaseMana",
      endTime: { lte: now },
    },
    include: {
      user: true,
    },
  });

  for (const passive of usersWithDecreasedMana) {
    const newMaxMana = passive.user.manaMax + (passive.value || 0);
    const newMana = Math.min(passive.user.mana, newMaxMana);
    await db.user.update({
      where: { id: passive.userId },
      data: { mana: newMana, manaMax: newMaxMana },
    });
  }
};

export const removeExpiredPassives = async (
  db: PrismaTransaction,
  now: Date,
) => {
  const passives = await db.userPassive.findMany({
    where: { endTime: { lte: now } },
    select: { userId: true, abilityName: true },
  });

  await db.userPassive.deleteMany({ where: { endTime: { lte: now } } });

  if (passives.length > 0) {
    await db.log.createMany({
      data: passives.map((passive) => ({
        userId: passive.userId,
        message: `Passive ${passive.abilityName} expired`,
        global: false,
      })),
    });
  }
};

export const activateCosmicEvent = async (db: PrismaTransaction) => {
  const cosmics = await db.cosmicEvent.findMany({
    where: {
      OR: [{ selectedForVg1: true }, { selectedForVg2: true }],
    },
    select: {
      triggerAtNoon: true,
      ability: {
        select: {
          name: true,
          type: true,
          value: true,
        },
      },
    },
  });

  // if no cosmics should trigger at noon, return
  const cosmicsToTrigger = cosmics.filter((c) => c.triggerAtNoon);
  if (!cosmicsToTrigger.length) {
    return;
  }

  // trigger all cosmics that should trigger at noon
  for (const cosmic of cosmicsToTrigger) {
    const usersWithCosmicPassive = await db.userPassive.findMany({
      where: {
        effectType: "Cosmic",
        abilityName: cosmic.ability?.name,
      },
      select: {
        userId: true,
      },
    });

    // either hp, damage, mana or xp
    const fieldToUpdate = cosmic.ability?.type.toString().toLowerCase() || "";

    await Promise.all(
      usersWithCosmicPassive.map(async (user) => {
        // validate value and passives
        switch (fieldToUpdate) {
          case "hp": {
            const targetUserHp = await healingValidator(
              db,
              user.userId,
              cosmic.ability?.value ?? 0,
            );
            // check if user is dead and return error message
            if (typeof targetUserHp === "string") {
              break;
            }
            await db.user.update({
              where: { id: user.userId },
              data: {
                hp: { increment: targetUserHp },
              },
              select: {
                username: true,
              },
            });
            break;
          }
          case "mana": {
            const targetUserMana = await manaValidator(
              db,
              user.userId,
              cosmic.ability?.value ?? 0,
            );
            // return error message if user cannot receive mana
            if (targetUserMana === 0) {
              return "Target is already at full mana";
            } else if (typeof targetUserMana === "string") {
              return targetUserMana;
            }
            await db.user.update({
              where: { id: user.userId },
              data: {
                mana: { increment: targetUserMana },
              },
              select: {
                username: true,
              },
            });
            break;
          }
          case "xp": {
            await experienceAndLevelValidator(
              db,
              user.userId,
              cosmic.ability?.value ?? 0,
            );
            break;
          }
          case "damage": {
            const targetUser = await db.user.findUnique({
              where: { id: user.userId },
              select: { hp: true, class: true },
            });
            if (!targetUser) break;
            const damageToTake = await damageValidator(
              db,
              user.userId,
              targetUser.hp,
              cosmic.ability?.value ?? 0,
              targetUser.class,
            );

            await db.user.update({
              where: { id: user.userId },
              data: {
                hp: { decrement: damageToTake },
              },
            });
            break;
          }
          default:
            break;
        }

        // TODO: improve this with fieldToUpdate logic
        // const targetedUser = await db.user.update({
        //   where: { id: user.userId },
        //   data: {
        //     [fieldToUpdate]: { increment: value },
        //   },
        //   select: {
        //     username: true,
        //   },
        // });

        const targetedUser = await db.user.findUnique({
          where: { id: user.userId },
          select: {
            username: true,
          },
        });

        await db.log.create({
          data: {
            userId: user.userId,
            message: `${targetedUser?.username} was affected by ${cosmic.ability?.name.replace(/-/g, " ")}`,
          },
        });
      }),
    );
  }
};

export const removeCosmicPassivesAndAbilities = async (
  db: PrismaTransaction,
) => {
  await db.userPassive.deleteMany({
    where: {
      cosmicEvent: true,
    },
  });

  await db.userAbility.deleteMany({
    where: {
      fromCosmic: true,
    },
  });
};

export const removeOldLogs = async (db: PrismaTransaction) => {
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  await db.log.deleteMany({
    where: {
      createdAt: { lte: twoWeeksAgo },
    },
  });
};

export const resetGameHighscores = async (db: PrismaTransaction) => {
  // Only for TypeQuest at the moment
  const topScores = await db.game.findMany({
    where: {
      status: "FINISHED",
      game: "TypeQuest",
      user: { publicHighscore: true },
    },
    orderBy: { score: "desc" },
    distinct: ["userId"],
    take: 3,
    select: { userId: true },
  });

  for (const { userId } of topScores) {
    await experienceAndLevelValidator(db, userId, 300);
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { username: true },
    });

    await db.log.create({
      data: {
        userId,
        message: `${user?.username} received 300 XP for being at the top of the weekly leaderboard in TypeQuest`,
      },
    });
  }

  await db.game.deleteMany();
};

export const sessionCleanup = async (db: PrismaTransaction) => {
  await db.session.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } }, // Expired sessions
        {
          updatedAt: {
            lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Sessions not used in 30 days
          },
        },
      ],
    },
  });
};

export const resetUserTurns = async (db: PrismaTransaction) => {
  const users = await db.user.findMany({
    select: {
      id: true,
      turns: true,
    },
  });
  for (const user of users) {
    // Check if user has a TurnPassive and get its value
    const turnPassive = await db.userPassive.findMany({
      where: {
        userId: user.id,
        effectType: "TurnPassive",
      },
      select: {
        value: true,
      },
    });

    let turnsToSet = 0;
    for (const turn of turnPassive) {
      if (turn.value) turnsToSet += turn.value;
    }

    // if user has more or less turns than the passive value, reset to passive value
    if (user.turns != turnsToSet) {
      await db.user.update({
        where: { id: user.id },
        data: { turns: turnsToSet },
      });

      await db.log.create({
        data: {
          global: false,
          userId: user.id,
          message: `You have regained your strength and are now ready to enter the dungeons once again!`,
        },
      });
    }
  }
};

export const randomCosmic = async (db: PrismaTransaction) => {
  // const now = new Date();
  // const today = now.toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format

  await db.cosmicEvent.updateMany({
    where: {
      OR: [
        { recommended: true },
        { selectedForVg1: true },
        { selectedForVg2: true },
      ],
    },
    data: {
      recommended: false,
      selectedForVg1: false,
      selectedForVg2: false,
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
  const events = await db.cosmicEvent.findMany({
    select: {
      name: true,
      frequency: true,
      occurrencesVg1: true,
      occurrencesVg2: true,
    },
  });

  if (events.length === 0) {
    throw new Error("No events available");
  }

  // Calculate weights based on frequency and occurrences
  const weights = events.map((event) => {
    const weight =
      event.frequency / 100 / (event.occurrencesVg1 + event.occurrencesVg2 + 1); //TODO: adjust for vg1/vg2
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

  const chosenCosmic = await db.cosmicEvent.update({
    where: {
      name: cosmic.name,
    },
    data: {
      recommended: true,
    },
  });

  return chosenCosmic;
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
        const targetUser = await db.user.findUnique({
          where: { id: user.id },
          select: { hp: true, class: true },
        });
        if (!targetUser) return;

        const damageToTake = await damageValidator(
          db,
          user.id,
          targetUser.hp,
          enemy.attack,
          targetUser.class,
        );
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
