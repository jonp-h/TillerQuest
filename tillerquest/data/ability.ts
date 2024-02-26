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

export const healOrDamageSingleUser = async (
  id: string,
  value: number,
  cost: number,
  xpGiven: number
) => {
  // error handling for cost is done clientside
  try {
    const targetHp = await db.user.findUnique({
      where: { id },
      select: { hp: true, hpMax: true },
    });

    // if hp is already 0, no need to update hp
    if (
      (targetHp?.hp === 0 && value < 0) ||
      (targetHp?.hp === targetHp?.hpMax && value > 0)
    ) {
      console.log("hp is already 0 or max");
      return null;
    }

    // if hp goes below 0, set it to 0
    else if (targetHp && targetHp.hp + value <= 0) {
      console.log("set hp to 0");
      await db.user.update({
        where: {
          id: id,
        },
        data: {
          hp: {
            set: 0,
          },
        },
      });
    }

    // if hp goes above max, set it to max
    else if (targetHp && targetHp.hp + value >= targetHp.hpMax) {
      console.log("set hp to max");
      await db.user.update({
        where: {
          id: id,
        },
        data: {
          hp: {
            set: targetHp.hpMax,
          },
        },
      });
    }

    // else increment hp by value
    else {
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
    }

    // finally decrement the cost from the user's mana
    // and increment the user's xp by the xpGiven
    await db.user.update({
      where: {
        id: id,
      },
      data: {
        mana: {
          decrement: cost,
        },
        xp: {
          increment: xpGiven,
        },
      },
    });

    return true;
  } catch (err) {
    console.log(err);
    return null;
  }
};
