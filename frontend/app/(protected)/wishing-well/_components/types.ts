import { Prisma } from "@tillerquest/prisma/browser";

export type WishWithVotes = Prisma.WishGetPayload<{
  select: {
    id: true;
    name: true;
    description: true;
    image: true;
    value: true;
    scheduled: true;
    wishVotes: {
      orderBy: { amount: "desc" };
      select: {
        anonymous: true;
        amount: true;
        user: {
          select: { username: true };
        };
      };
    };
  };
}>;
