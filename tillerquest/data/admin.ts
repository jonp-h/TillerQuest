"use server";
import { db } from "@/lib/db";

// current limitations/bug with prisma studio make the admin unable to add new records in models with many-to-many relationships
// https://github.com/prisma/studio/issues/980
export const createAbility = async () => {
  const abilityData = {
    name: "passiveTest5",
    type: "Passive",
    description: "test",
    duration: 1,
    icon: "test",
    cost: 1,
    xpGiven: 1,
    value: 1,
    parents: {
      connect: {
        name: "passiveTest2",
      },
    },
  };

  try {
    const newAbility = await db.ability.create({
      data: abilityData,
    });
    console.log("New ability created:", newAbility);
  } catch (error: any) {
    console.error("Error creating ability:", error.message);
    throw new Error("Unable to create ability");
  }
};
