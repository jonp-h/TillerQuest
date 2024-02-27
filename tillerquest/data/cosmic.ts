// needs use server to specifically call the code on the server
// server actions
"use server";
import { db } from "@/lib/db";

export const getDailyCosmic = async () => {
  const today = new Date().toISOString().slice(0, 10);

  try {
    const cosmic = await db.cosmicEvent.findUnique({
      where: {
        dateRevealed: today,
      },
    });

    return cosmic;
  } catch {
    return null;
  }
};
