import { Prisma } from "@prisma/client";

export type UserSettings = Prisma.UserGetPayload<{
  select: {
    id: true;
    username: true;
    publicHighscore: true;
    archiveConsent: true;
  };
}>;
