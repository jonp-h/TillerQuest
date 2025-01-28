import express from "express";
import http from "http";
import bodyParser from "body-parser";
import cors from "cors";
import { db } from "./lib/db.js";
import {
  authenticatedGameMaster,
  authenticatedUser,
  currentSession,
} from "./middleware/auth.js";
import { auth } from "./middleware/auth.js";
import rateLimit from "express-rate-limit";
import cron from "node-cron";
import { randomCosmic } from "./data/cosmic.js";
import { exec } from "child_process";

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
  })
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

        const usersWithIncreaseMana = await db.userPassive.findMany({
          where: {
            effectType: "IncreaseMana",
            endTime: { lte: now },
          },
          include: {
            user: true,
          },
        });

        for (const passive of usersWithIncreaseMana) {
          await db.user.update({
            where: { id: passive.userId },
            data: { manaMax: { decrement: passive.value || 0 } },
          });
        }

        await db.userPassive.deleteMany({ where: { endTime: { lte: now } } });
        console.log("Expired passives removed");
      });
    } catch (error) {
      console.error("Error removing expired passives:", error);
    }
  },
  {
    name: "removeExpiredPassivesService",
  }
);

// Schedule a job to run every day at midnight to generate a random cosmic event
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
  }
);

// Schedule a job to run every day at midnight to backup the database
cron.schedule(
  "1 00 * * *",
  async () => {
    try {
      exec(
        "docker exec -t postgres_container pg_dumpall -U tillerquest > dump_backup.sql && docker cp postgres_container:dump_backup.sql db/backup/TQ_backup_" +
          new Date()
            .toISOString()
            .replace(/[:.]/g, "-")
            .replace("T", "_")
            .replace("Z", "")
            .slice(0, -7) +
          ".sql",
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
        }
      );
    } catch (error) {
      console.error("Error during database backup:", error);
    }
  },
  {
    name: "databaseBackupService",
  }
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
