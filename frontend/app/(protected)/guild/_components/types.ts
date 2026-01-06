import { Prisma } from "@tillerquest/prisma/browser";

export type GuildSettings = Prisma.GuildGetPayload<{
  select: {
    name: true;
    schoolClass: true;
    guildLeader: true;
    nextGuildLeader: true;
    level: true;
    icon: true;
    nextBattleVotes: true;
    enemies: {
      select: {
        name: true;
        health: true;
      };
    };
    members: {
      select: {
        id: true;
        image: true;
        title: true;
        titleRarity: true;
        username: true;
        hp: true;
        hpMax: true;
        mana: true;
        manaMax: true;
      };
    };
    imageUploads: {
      where: {
        status: "PENDING";
      };
      select: {
        id: true;
      };
    };
  };
}>;

export type GuildLeaderboardType = Prisma.GuildGetPayload<{
  select: {
    name: true;
    schoolClass: true;
    guildLeader: true;
    level: true;
    icon: true;
    members: {
      select: {
        id: true;
        username: true;
      };
    };
  };
}>[];
