import { Prisma } from "@tillerquest/prisma/browser";

export type UserSettings = Prisma.UserGetPayload<{
  select: {
    id: true;
    username: true;
    publicHighscore: true;
    archiveConsent: true;
  };
}>;
