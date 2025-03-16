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
import { exec } from "child_process";
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
          await db.user.update({
            where: { id: passive.userId },
            data: { hpMax: { decrement: passive.value || 0 } },
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
          await db.user.update({
            where: { id: passive.userId },
            data: { manaMax: { decrement: passive.value || 0 } },
          });
        }

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

// Schedule a job to run every day at midnight to backup the database
cron.schedule(
  "1 00 * * *",
  async () => {
    try {
      exec(
        `docker exec -t postgres_container bash -c "pg_dumpall -U tillerquest > /dump_backup.sql" && docker cp postgres_container:/dump_backup.sql db/backup/TQ_backup_${new Date()
          .toISOString()
          .replace(/[:.]/g, "-")
          .replace("T", "_")
          .replace("Z", "")
          .slice(0, -7)}.sql"`,
        (error, stdout, stderr) => {
          if (error) {
            console.error(`Error creating database backup: ${error.message}`);
            return;
          }
          if (stderr) {
            console.error(`Backup stderr: ${stderr}`);
            return;
          }
          console.log(`Database backup created: ${stdout}`);

          // Remove old backups, keeping only the 30 most recent (does not work on Windows)
          exec(
            `ls -t db/backup/*.sql | tail -n +31 | xargs rm --`,
            (error, stdout, stderr) => {
              if (error) {
                console.error(`Error removing old backups: ${error.message}`);
                return;
              }
              if (stderr) {
                console.error(`Remove old backups stderr: ${stderr}`);
                return;
              }
              console.log(`Old backups removed: ${stdout}`);
            },
          );
        },
      );
    } catch (error) {
      console.error("Error during database backup:", error);
    }
  },
  {
    name: "databaseBackupService",
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
