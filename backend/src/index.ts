import express from "express";
import cors from "cors";
import { db } from "./lib/db.js";
import cron from "node-cron";
import { randomCosmic, weeklyGuildReset } from "./cronjobs.js";
import {
  damageValidator,
  experienceAndLevelValidator,
  healingValidator,
  manaValidator,
} from "./data/validators.js";
// import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
// import { auth } from "./auth.js";
// import authRoutes from "./routes/auth.js";
import leaderboardRoutes from "./routes/leaderboard.js";
import rateLimit from "express-rate-limit";
import { logger } from "lib/logger.js";

const app = express();

// ------ Uncomment the following line to enable Better Auth authentication ------
// app.use("/auth", authRoutes);

// app.all("/api/auth/{*any}", toNodeHandler(auth));

// ----------------------------------------------------------------------------

// Mount express json middleware after Better Auth handler
// or only apply it to routes that don't interact with Better Auth
app.use(express.json());

// Rate limiting to prevent abuse and DoS attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use(limiter);

app.use(
  cors({
    origin: "http://localhost:3000", // The frontend's origin
    methods: ["GET"], //  Allowed HTTP methods: ["GET", "POST", "PUT", "DELETE"]
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  }),
);

// app.use("/api/me", async (req, res) => {
//   const session = await auth.api.getSession({
//     headers: fromNodeHeaders(req.headers),
//   });
//   res.json(session);
//   return;
// });

app.use("/api", leaderboardRoutes);

// const server = http.createServer(app);

// Schedule a job to run every minute to remove expired abilities
cron.schedule(
  "* * * * *",
  async () => {
    const now = new Date();
    try {
      await db.$transaction(async (db) => {
        // ------ Remove passives with increased values ------
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
          const newHp = Math.min(
            passive.user.hp,
            passive.user.hpMax - (passive.value ?? 0),
          );
          await db.user.update({
            where: { id: passive.userId },
            data: { hp: newHp, hpMax: { decrement: passive.value || 0 } },
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
          const newMana = Math.min(
            passive.user.mana,
            passive.user.manaMax - (passive.value ?? 0),
          );
          await db.user.update({
            where: { id: passive.userId },
            data: { mana: newMana, manaMax: { decrement: passive.value || 0 } },
          });
        }
        // ------- Remove passives with decreased values -------

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
          const newHp = Math.min(
            passive.user.hp,
            passive.user.hpMax + (passive.value ?? 0),
          );
          await db.user.update({
            where: { id: passive.userId },
            data: { hp: newHp, hpMax: { increment: passive.value || 0 } },
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
          const newMana = Math.min(
            passive.user.mana,
            passive.user.manaMax + (passive.value ?? 0),
          );
          await db.user.update({
            where: { id: passive.userId },
            data: { mana: newMana, manaMax: { increment: passive.value || 0 } },
          });
        }

        // ------- Remove all ended passives -------

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

        console.log("Expired passives removed");
      });
    } catch (error) {
      console.error("Error removing expired passives:", error);
    }
  },
  {
    name: "removeExpiredPassivesService",
  },
);

// Schedule a job to run every day at 11:20 to activate cosmic event
cron.schedule(
  "20 11 * * *",
  async () => {
    try {
      const cosmic = await db.cosmicEvent.findFirst({
        where: {
          selected: true,
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

      // if cosmic should not activate
      if (!cosmic?.triggerAtNoon) {
        return;
      }

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

      await db.$transaction(async (db) => {
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
                  return targetUserHp;
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
                const damageToTake = await damageValidator(
                  db,
                  user.userId,
                  cosmic.ability?.value ?? 0,
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
      });

      console.log("Triggered cosmic event");
    } catch (error) {
      console.error("Error triggering cosmic event:", error);
    }
  },
  {
    name: "triggerCosmicEventService",
  },
);

// Schedule a job to run every day before midnight to remove all cosmic passives, abilities and 14 day old logs.
cron.schedule(
  "59 23 * * *",
  async () => {
    try {
      await db.userPassive.deleteMany({
        where: {
          effectType: "Cosmic",
        },
      });

      await db.userAbility.deleteMany({
        where: {
          fromCosmic: true,
        },
      });

      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      await db.log.deleteMany({
        where: {
          createdAt: { lte: twoWeeksAgo },
        },
      });

      console.log("Removed cosmic passives, abilities and logs.");
    } catch (error) {
      console.error(
        "Error removing cosmic passives, abilities and logs:",
        error,
      );
    }
  },
  {
    name: "generateRandomCosmicEventService",
  },
);

// Schedule a job to run every day at midnight to recommend a random cosmic event
cron.schedule(
  "0 0 * * *",
  async () => {
    try {
      await db.$transaction(async (db) => {
        await randomCosmic(db);
        console.log("Generated random cosmic event");
      });
    } catch (error) {
      logger.error("Generated random cosmic event:", error);
    }
  },
  {
    name: "generateRandomCosmicEventService",
  },
);

// Schedule a job to run every sunday to remove game highscores
cron.schedule(
  "59 23 * * 0",
  async () => {
    try {
      const topScores = await db.game.findMany({
        where: {
          status: "FINISHED",
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
    } catch (error) {
      console.error("Error during game highscore reset:", error);
    }
  },
  {
    name: "gameHighscoreResetService",
  },
);

// Schedule a job to run every sunday to reset guilds
cron.schedule(
  "04 00 * * 0",
  async () => {
    try {
      await db.$transaction(async (db) => {
        await weeklyGuildReset(db);
        console.log("Weekly guild reset completed");
      });
    } catch (error) {
      console.error("Error during weekly guild reset:", error);
    }
  },
  {
    name: "weeklyGuildResetService",
  },
);

// Schedule a job to run every day at 23:58 PM, clears expired sessions and sessions not used in 30 days.
cron.schedule(
  "58 23 * * *",
  async () => {
    try {
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
    } catch (error) {
      console.log(error);
    }
  },
  {
    name: "clearExpiredSessions",
  },
);

//TODO: implement passives to give increased # of turns
// Schedule a job to run every weekday morning at 00:02 AM, resets all users turn.
cron.schedule(
  "2 0 * * 1-5",
  async () => {
    try {
      const usersWithTurnFinished = await db.user.findMany({
        where: {
          turns: 0,
        },
        select: {
          id: true,
          username: true,
          turns: true,
        },
      });
      for (const user of usersWithTurnFinished) {
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

        await db.user.update({
          where: { id: user.id },
          data: { turns: turnsToSet },
        });

        await db.log.create({
          data: {
            global: false,
            userId: user.id,
            message: `You have regained your strength and are now ready to enter the dungeon once again!`,
          },
        });
      }
    } catch (error) {
      console.log(error);
    }
  },
  {
    name: "resetTurn",
  },
);

// Schedule a job to run every weekday at 00:05 AM, removes the guilds enemy if it's dead.
cron.schedule(
  "5 0 * * 1-5",
  async () => {
    try {
      await db.$transaction(async (db) => {
        const deadEnemies = await db.guildEnemy.findMany({
          where: {
            health: {
              lte: 0,
            },
          },
        });

        for (const enemy of deadEnemies) {
          await db.guild.update({
            where: { name: enemy.guildName },
            data: {
              level: {
                increment: 1, // Increment guild level by 1
              },
            },
          });

          await db.guildEnemy.delete({
            where: { id: enemy.id },
          });
        }
      });
      console.log("Removed dead guild enemies and updated guild levels.");
    } catch (error) {
      console.log(error);
    }
  },
  {
    name: "resetSlainEnemies",
  },
);

// Schedule a job to run at 15:15 every weekday to damage active players if the Enemy hasn't been defeated.
cron.schedule(
  "15 15 * * 1-5",
  async () => {
    try {
      // For each guild enemy, damage all members of that guild by 5 HP
      const guildEnemies = await db.guildEnemy.findMany({
        where: {
          health: { gt: 0 },
        },
        select: {
          guildName: true,
          name: true,
          attack: true,
        },
      });

      for (const enemy of guildEnemies) {
        // Only select users from this guild who has fetched mana today
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const users = await db.user.findMany({
          where: {
            guildName: enemy.guildName,
            lastMana: {
              gte: startOfToday,
            },
          },
          select: {
            id: true,
            username: true,
            guildName: true,
          },
        });

        for (const user of users) {
          const damageToTake = await damageValidator(db, user.id, enemy.attack);
          await db.user.update({
            where: { id: user.id },
            data: {
              hp: { decrement: damageToTake },
            },
          });

          await db.log.create({
            data: {
              global: false,
              userId: user.id,
              message: `${user.username} fought alongside their guildmates in the dungeon, and took ${damageToTake} damage from a spooky ${enemy.name}`,
            },
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  },
  {
    name: "dungeonDamage",
  },
);

// print out scheduled tasks
console.log("Started cron jobs:");
cron.getTasks().forEach((task, name) => {
  console.log(` - ${name}`);
});

app.listen(8080, () => {
  console.log("🚀 Server is running at http://localhost:8080");
});
// Might consider to disconnect from db if there is a short script running in a long process https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/connection-management#disconnect
// https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections#prismaclient-in-long-running-applications
