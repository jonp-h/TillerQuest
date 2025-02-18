import { PrismaClient } from "@prisma/client";
import guilds from "./guilds.js";
import users from "./users.js";
import abilities from "./abilities.js";
import cosmic from "./cosmic.js";
import shopItem from "./shopItems.js";

// Initialize Prisma Client
const db = new PrismaClient();

async function main() {
  try {
    await db.guild.createMany({
      data: guilds,
      skipDuplicates: true,
    });
    console.info("Guilds have been added to the database.");
  } catch (error) {
    console.error("Error: ", error);
  }

  abilities.forEach(async (ability) => {
    try {
      await db.ability.upsert({
        where: { name: ability.name },
        update: ability,
        create: ability,
      });
    } catch (error) {
      console.error("Error adding", ability.name + ": ", error);
    }
  });

  console.info("Abilities have been added to the database.");

  cosmic.forEach(async (cosmic) => {
    try {
      await db.cosmicEvent.upsert({
        where: { name: cosmic.name },
        update: cosmic,
        create: cosmic,
      });
    } catch (error) {
      console.error("Error adding", cosmic.name + ": ", error);
    }
  });

  console.info("Cosmic events have been added to the database.");

  shopItem.forEach(async (shopItem) => {
    try {
      await db.shopItem.upsert({
        where: { name: shopItem.name },
        update: shopItem,
        create: shopItem,
      });
    } catch (error) {
      console.error("Error adding", cosmic.name + ": ", error);
    }
  });

  console.info("Shop items have been added to the database.");

  try {
    await db.user.createMany({
      data: users,
      skipDuplicates: true,
    });
    console.info("Users have been added to the database.");
  } catch (error) {
    console.error("Error: ", error);
  }
}

// Run the main function and handle any errors
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
