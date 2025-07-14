import { db } from "../lib/db.js";
import {
  uncommonRarity,
  rareRarity,
  epicRarity,
  legendaryRarity,
  mythicRarity,
} from "../gameSettings.js";
import { $Enums } from "@prisma/client";

export async function calculateRarity() {
  await db.$transaction(async (db) => {
    // based on how many owners an item has, calculate its rarity
    const items = await db.shopItem.findMany({
      select: {
        id: true,
        name: true,
        rarity: true,
        _count: {
          select: { users: true },
        },
      },
    });

    const totalUsers = await db.user.count();

    for (const item of items) {
      let rarity = "Common"; // default rarity
      const ratio = item._count.users / totalUsers;
      if (ratio < mythicRarity) {
        rarity = "Mythic";
      } else if (ratio < legendaryRarity) {
        rarity = "Legendary";
      } else if (ratio < epicRarity) {
        rarity = "Epic";
      } else if (ratio < rareRarity) {
        rarity = "Rare";
      } else if (ratio < uncommonRarity) {
        rarity = "Uncommon";
      }

      console.log(
        `Item: ${item.name}, Users: ${item._count.users}, Total Users: ${totalUsers}, Rarity: ${rarity}`,
      );

      if (item.rarity !== rarity) {
        await db.shopItem.update({
          where: { id: item.id },
          data: { rarity: rarity as $Enums.Rarity },
        });

        console.log(
          `Updated item ${item.name} rarity from ${item.rarity} to ${rarity}`,
        );

        const usersWithUpdatedRarity = await db.user.updateManyAndReturn({
          where: { title: item.name },
          data: { titleRarity: rarity as $Enums.Rarity },
          select: { id: true },
        });

        for (const user of usersWithUpdatedRarity) {
          await db.log.create({
            data: {
              userId: user.id,
              global: true,
              message: `RARITY CHANGED: Item ${item.name} rarity has gone from ${item.rarity} to ${rarity}`,
            },
          });
        }
      }
    }
  });
}
