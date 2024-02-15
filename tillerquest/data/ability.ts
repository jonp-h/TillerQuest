// needs use server to specifically call the code on the server
// server actions
"use server";
import { db } from "@/lib/db";

export const getAbilityByName = async (name: string) => {
  try {
    const ability = await db.ability.findUnique({ where: { name } });

    return ability;
  } catch {
    return null;
  }
};

export const useAbilityOnSingleUser = async (id: string, value: number) => {
  try {
    console.log("ability heal ", value, " on user ", id);
    await db.user.update({
      where: {
        id: id,
      },
      data: {
        hp: {
          // add or subtract the value from the current hp
          increment: value,
        },
      },
    });
    return true;
  } catch (err) {
    console.log(err);
    return null;
  }
};
