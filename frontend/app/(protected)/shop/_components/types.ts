import { Prisma } from "@prisma/client";

export type UserInventory = Prisma.UserGetPayload<{
  select: {
    id: true;
    title: true;
    class: true;
    gold: true;
    level: true;
    inventory: true;
    special: true;
  };
}>;
