import { Prisma } from "@tillerquest/prisma/browser";

export type DungeonInfo = Prisma.GuildGetPayload<{
  select: {
    name: true;
    enemies: {
      select: {
        id: true;
        health: true;
        name: true;
        icon: true;
        attack: true;
        xp: true;
        gold: true;
      };
    };
  };
}>;
