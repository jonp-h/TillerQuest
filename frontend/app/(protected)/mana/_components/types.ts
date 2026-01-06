import { Prisma } from "@tillerquest/prisma/browser";

export type LastMana = Prisma.UserGetPayload<{
  select: {
    id: true;
    lastMana: true;
  };
}>;
