// import { Prisma, PrismaClient } from "@prisma/client";
// import { DefaultArgs } from "@prisma/client/runtime/library";

import { Prisma } from "@prisma/client";

// export type PrismaTransaction = Omit<
//   PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
//   "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
// >;

export type PrismaTransaction = Prisma.TransactionClient;
