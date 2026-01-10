import { Prisma } from "@tillerquest/prisma/browser";

export type AdminDeadUser = Prisma.UserGetPayload<{
  select: {
    id: true;
    username: true;
    name: true;
    lastname: true;
    image: true;
    level: true;
  };
}>;
