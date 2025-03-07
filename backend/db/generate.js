import { PrismaClient } from "@prisma/client";
import guilds from "./guilds.js";
import users from "./users.js";
import abilities from "./abilities.js";
import cosmics from "./cosmic.js";
import shopItem from "./shopItems.js";
import readline from "readline";

// Initialize Prisma Client
const db = new PrismaClient();

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const options = `
  Please choose an option:
  1. Add Guilds
  2. Add Abilities
  3. Add Cosmic Events
  4. Add Shop Items
  5. Add Mocked Users
  6. Add All
  7. Add all without users
  `;

  rl.question(options, async (answer) => {
    switch (answer) {
      case "1":
        await addGuilds();
        break;
      case "2":
        await addAbilities();
        break;
      case "3":
        await addCosmicEvents();
        break;
      case "4":
        await addShopItems();
        break;
      case "5":
        await addUsers();
        break;
      case "6":
        await addAll();
        break;
      case "7":
        await addAllWithoutUsers();
        break;
      default:
        console.log("Invalid option");
    }
    rl.close();
  });
}

async function addGuilds() {
  try {
    await db.guild.createMany({
      data: guilds,
      skipDuplicates: true,
    });
    console.info("Guilds have been added to the database.");
  } catch (error) {
    console.error("Error: ", error);
  }
}

async function addAbilities() {
  for (const ability of abilities) {
    try {
      await db.ability.upsert({
        where: { name: ability.name },
        update: ability,
        create: ability,
      });
    } catch (error) {
      console.error("Error adding", ability.name + ": ", error);
    }
  }
  console.info("Abilities have been added to the database.");
}

async function addCosmicEvents() {
  for (const cosmic of cosmics) {
    try {
      await db.cosmicEvent.upsert({
        where: { name: cosmic.name },
        update: cosmic,
        create: cosmic,
      });
    } catch (error) {
      console.error("Error adding", cosmic.name + ": ", error);
    }
  }
  console.info("Cosmic events have been added to the database.");
}

async function addShopItems() {
  for (const item of shopItem) {
    try {
      await db.shopItem.upsert({
        where: { name: item.name },
        update: item,
        create: item,
      });
    } catch (error) {
      console.error("Error adding", item.name + ": ", error);
    }
  }
  console.info("Shop items have been added to the database.");
}

async function addUsers() {
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

async function addAll() {
  await addGuilds();
  await addAbilities();
  await addCosmicEvents();
  await addShopItems();
  await addUsers();
}

async function addAllWithoutUsers() {
  await addGuilds();
  await addAbilities();
  await addCosmicEvents();
  await addShopItems();
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
