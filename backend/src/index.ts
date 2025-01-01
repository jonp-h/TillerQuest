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

const app = express();

// Rate limiting to prevent abuse and DDoS attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 70, // limit each IP to 100 requests per windowMs
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

app.get("/gm", authenticatedGameMaster, async (req, res) => {
  const users = await db.user.findMany();
  res.json(users);
});

app.get("/users", authenticatedUser, async (req, res) => {
  const users = await db.user.findMany();
  res.json(users);
});

app.get("/", (req, res) => {
  const { session } = res.locals;
  res.send({ user: res.locals });
});

server.listen(8080, () => {
  console.log("🚀 Server is running at http://localhost:8080");
});
// Might consider to disconnect from db if there is a short script running in a long process https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/connection-management#disconnect
// https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections#prismaclient-in-long-running-applications
