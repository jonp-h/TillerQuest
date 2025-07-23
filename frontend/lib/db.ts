import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

export const db = globalThis.prisma || new PrismaClient();

//makes sure we don't create a new connection if one already exists
if (process.env.NODE_ENV !== "production") globalThis.prisma = db;
