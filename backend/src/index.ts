import express from "express";
import http from "http";
import bodyParser from "body-parser";
import cors from "cors";
import { db } from "./lib/db.js";
import {
  // authenticatedGameMaster,
  // authenticatedUser,
  currentSession,
} from "./middleware/auth.js";
import { auth } from "./middleware/auth.js";
import rateLimit from "express-rate-limit";
import cron from "node-cron";
import { randomCosmic } from "./data/cosmic.js";
import {
  damageValidator,
  experienceAndLevelValidator,
  healingValidator,
  manaValidator,
} from "./data/validators.js";

const app = express();

// Rate limiting to prevent abuse and DoS attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 70, // limit each IP to 70 requests per windowMs
});

app.use(
  cors({
    origin: "http://localhost:3000", // only allow requests from localhost
    credentials: true, // include cookies in requests
  }),
);
app.use(bodyParser.json()); // Middleware to parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); //  URL-encoded data, allowing for rich objects and arrays to be encoded into the URL-encoded format.

app.use("/auth/*", limiter, auth);

app.use(currentSession);

const server = http.createServer(app);

// app.get("/gm", authenticatedGameMaster, async (req, res) => {
//   const users = await db.user.findMany();
//   res.json(users);
// });

// app.get("/users", authenticatedUser, async (req, res) => {
//   const users = await db.user.findMany();
//   res.json(users);
// });

// app.get("/", (req, res) => {
//   const { session } = res.locals;
//   res.send({ user: res.locals });
// });

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

// Schedule a job to run every day before midnight to remove all cosmic passives, abilities and 14 day old logs
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

      console.log("Removed cosmic passives, abilities and logs");
    } catch (error) {
      console.error("Error removing cosmic passives and abilities:", error);
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
      //TODO: remove all arena tokens

      await randomCosmic();
      console.log("Generated random cosmic event");
    } catch (error) {
      console.error("Generated random cosmic event:", error);
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

//TODO: implement passives to give increased # of turns
// Schedule a job to run every morning at 00:02 AM, resets all users turn.
cron.schedule(
  "2 0 * * *",
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
// TODO: might change to weekly
// Schedule a job to run every day at 07:59 AM, resets the guilds enemy if it's dead.
cron.schedule(
  "59 7 * * *",
  async () => {
    try {
      const deadEnemies = await db.guildEnemy.findMany({
        where: {
          health: {
            lte: 0,
          },
        },
        select: {
          id: true,
          guild: true,
          enemy: true,
          health: true,
        },
      });
      // For each dead enemy, pick the next enemy by incrementing the enemyId
      for (const enemy of deadEnemies) {
        // Find the next enemy in the enemy table
        const nextEnemy = await db.enemy.findFirst({
          where: {
            id: { gt: enemy.enemy.id },
          },
          orderBy: { id: "asc" },
        });

        // If there is a next enemy, assign it; otherwise, restart from the first enemy
        let newEnemy = nextEnemy;
        if (!newEnemy) {
          newEnemy = await db.enemy.findFirst({
            orderBy: { id: "asc" },
          });
        }

        if (newEnemy) {
          await db.guildEnemy.update({
            where: { id: enemy.id },
            data: {
              enemyId: newEnemy.id,
              name: newEnemy.name,
              health: newEnemy.maxHealth,
            },
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  },
  {
    name: "resetSlainEnemies",
  },
);

// FIXME: should be changed
// TODO: Change to a fully CRUD-like system
// Schedule a job to run every monday at 09:00 AM, creates an enemy for all guilds.
cron.schedule(
  "0 9 * * *",
  async () => {
    try {
      const guilds = await db.guild.findMany();
      // For each guild, check if it already has an enemy. If not, create one.
      for (const guild of guilds) {
        const existingEnemy = await db.guildEnemy.findFirst({
          where: { guildName: guild.name },
        });

        if (!existingEnemy) {
          const enemy = await db.enemy.findFirst({
            where: {
              id: 1, // Hardcoded for now. All guilds start with the easiest enemy
            },
          });

          if (enemy) {
            await db.guildEnemy.create({
              data: {
                guildName: guild.name,
                enemyId: enemy.id,
                name: enemy.name,
                health: enemy.maxHealth,
              },
            });
          }
        }
        console.log("Enemy created for guilds");
      }
    } catch (error) {
      console.error("Error generating unique enemies:", error);
    }
  },
  {
    name: "generateEnemies",
  },
);

// Schedule a job to run at 15:00 everyday to damage active players if the Enemy hasn't been defeated.
// TODO: Change to reflect enemy attack dice value
cron.schedule(
  "0 15 * * *",
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
        },
      });

      for (const enemy of guildEnemies) {
        // Only select users from this guild who has been active today
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const users = await db.user.findMany({
          where: {
            guildName: enemy.guildName,
            updatedAt: {
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
          const damageToTake = await damageValidator(db, user.id, 5);
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
              message: `${user.username} ventured into the dungeon and took 5 damage from a scary ${enemy.name}`,
            },
          });
        }
        console.log("Dungeon damage recieved");
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

server.listen(8080, () => {
  console.log("🚀 Server is running at http://localhost:8080");
});
// Might consider to disconnect from db if there is a short script running in a long process https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/connection-management#disconnect
// https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections#prismaclient-in-long-running-applications
