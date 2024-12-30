import express from "express";
import http from "http";
import bodyParser from "body-parser";
import cors from "cors";
import { db } from "./lib/db";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000", // only allow requests from localhost
    credentials: true, // include cookies in requests
  })
);
app.use(bodyParser.json()); // Middleware to parse JSON bodies
// app.use(bodyParser.urlencoded({ extended: true })); //  URL-encoded data, allowing for rich objects and arrays to be encoded into the URL-encoded format.

const server = http.createServer(app);

app.get("/users", async (req, res) => {
  const users = await db.user.findMany();
  res.json(users);
});

server.listen(8080, () => {
  console.log("🚀 Server is running at http://localhost:8080");
});
// Might consider to disconnect from db if there is a short script running in a long process https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/connection-management#disconnect
// https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections#prismaclient-in-long-running-applications
