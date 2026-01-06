import { Prisma } from "@tillerquest/prisma/browser";

export type NewUser = Prisma.UserGetPayload<{
  select: {
    id: true;
    name: true;
    username: true;
    lastname: true;
    publicHighscore: true;
  };
}>;

export type GuildWithMemberClasses = Prisma.GuildGetPayload<{
  select: {
    id: true;
    name: true;
    members: {
      select: {
        class: true;
      };
    };
  };
}>;

export type ChooseGuildResponse = {
  guilds: GuildWithMemberClasses[];
  maxMembers: number;
};
