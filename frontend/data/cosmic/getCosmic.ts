"use server";

import { db } from "@/lib/db";

export const getCosmic = async () => {
  const cosmic = await db.cosmicEvent.findFirst({
    where: {
      selected: true,
    },
  });
  return cosmic;
};
