import { Prisma } from "@tillerquest/prisma/browser";

export type UserLeaderboard = Prisma.UserGetPayload<{
  select: {
    xp: true;
    title: true;
    titleRarity: true;
    name: true;
    username: true;
    lastname: true;
    image: true;
    level: true;
    class: true;
    guildName: true;
    schoolClass: true;
  };
}>;

export type Leaderboards = {
  vg1: UserLeaderboard[];
  vg2: UserLeaderboard[];
};

export type DeadUser = {
  id: string;
  username: string;
};
