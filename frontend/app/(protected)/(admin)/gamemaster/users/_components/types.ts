import { Prisma } from "@tillerquest/prisma/browser";

export type AdminUserResponse = Prisma.UserGetPayload<{
  select: {
    id: true;
    name: true;
    lastname: true;
    username: true;
    special: true;
    role: true;
    schoolClass: true;
    access: true;
  };
}>;
