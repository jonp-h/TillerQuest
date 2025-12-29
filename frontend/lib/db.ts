import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

export const db =
  globalThis.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

//makes sure we don't create a new connection if one already exists
if (process.env.NODE_ENV !== "production") globalThis.prisma = db;

export * from "@prisma/client";
