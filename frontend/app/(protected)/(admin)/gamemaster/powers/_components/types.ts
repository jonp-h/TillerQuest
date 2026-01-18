import { Prisma } from "@tillerquest/prisma/browser";

export type UserResponse = Prisma.UserGetPayload<{
  select: {
    id: true;
    name: true;
    username: true;
    lastname: true;
    role: true;
    hp: true;
    mana: true;
    xp: true;
    gold: true;
    level: true;
    class: true;
    guildName: true;
    schoolClass: true;
  };
}>;
