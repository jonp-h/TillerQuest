import { Prisma } from "@tillerquest/prisma/browser";

export type GuildType = Prisma.GuildGetPayload<{
  select: {
    name: true;
    schoolClass: true;
    archived: true;
    guildLeader: true;
    nextGuildLeader: true;
    members: {
      select: {
        id: true;
        name: true;
        lastname: true;
        schoolClass: true;
      };
    };
  };
}>;

export type GuildResponse = {
  activeGuilds: GuildType[];
  archivedGuilds: GuildType[];
};

export type BasicUser = {
  id: string;
  name: string;
  lastname: string;
  schoolClass: string | null;
};
