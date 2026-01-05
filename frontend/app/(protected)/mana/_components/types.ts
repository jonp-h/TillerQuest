import { Prisma } from "@prisma/client";

export type LastMana = Prisma.UserGetPayload<{
  select: {
    id: true;
    lastMana: true;
  };
}>;
