import { PrismaClient } from "@prisma/client";
import guilds from "./guilds.js";
import users from "./users.js";
import abilities from "./abilities.js";
import cosmics from "./cosmic.js";
import shopItems from "./shopItems.js";
import readline from "readline";
import typeQuestTexts from "./typeQuestTexts.js";
import enemies from "./enemies.js";

// Initialize Prisma Client
const db = new PrismaClient();

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const options = `
  Please choose an option:
  1. Add All
  2. Add all without users
  3. Add Guilds
  4. Add Abilities
  5. Add Cosmic Events
  6. Add Shop Items
  7. Add Mocked Users
  8. Add Type Quest Texts
  9. Add Enemies
  DANGERZONE:
  99. Set all users to NEW
  `;

  rl.question(options, async (answer) => {
    switch (answer) {
      case "1":
        await addAll();
        break;
      case "2":
        await addAllWithoutUsers();
        break;
      case "3":
        await addGuilds();
        break;
      case "4":
        await addAbilities();
        break;
      case "5":
        await addCosmicEvents();
        break;
      case "6":
        await addShopItems();
        break;
      case "7":
        await addUsers();
        break;
      case "8":
        await addTypeQuestTexts();
        break;
      case "9":
        await addEnemies();
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
  for (const item of shopItems) {
    try {
      console.log("Adding", item.name);
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

async function addTypeQuestTexts() {
  for (const typeQuestText of typeQuestTexts) {
    try {
      await db.typeQuestText.upsert({
        where: { text: typeQuestText.text },
        update: { text: typeQuestText.text },
        create: { text: typeQuestText.text },
      });
    } catch (error) {
      console.error("Error adding", typeQuestText + ": ", error);
    }
  }
  console.info("Type quest texts have been added to the database.");
}

async function addEnemies() {
  for (const enemy of enemies) {
    try {
      await db.enemy.upsert({
        where: { name: enemy.name },
        update: enemy,
        create: enemy,
      });
    } catch (error) {
      console.error("Error adding", enemy + ": ", error);
    }
  }
  console.info("Enemies has been added to the database.");
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
  await addTypeQuestTexts();
  await addUsers();
  await addEnemies();
}

async function addAllWithoutUsers() {
  await addGuilds();
  await addAbilities();
  await addCosmicEvents();
  await addShopItems();
  await addTypeQuestTexts();
  await addEnemies();
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
