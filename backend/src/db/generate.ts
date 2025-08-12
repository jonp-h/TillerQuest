import {
  $Enums,
  AbilityType,
  Class,
  PrismaClient,
  SchoolClass,
} from "@prisma/client";
import guilds from "./guilds.js";
import users from "./users.js";
import abilities from "./abilities.js";
import cosmics from "./cosmic.js";
import shopItems from "./shopItems.js";
import readline from "readline";
import typeQuestTexts from "./typeQuestTexts.js";
import enemies from "./enemies.js";
import gameSettings from "./gameSettings.js";
import wordQuestWords from "./wordQuestWords.js";
import wishes from "./wishes.js";

// Initialize Prisma Client
const db = new PrismaClient();

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const options = `
  Please choose an option:
  - ADD:
  1. Add All
  2. Add all without users
  3. Add Guilds
  4. Add Abilities
  5. Add Cosmic Events
  6. Add Shop Items
  7. Add Mocked Users
  8. Add Type Quest Texts
  9. Add Enemies
  10. Add Game Settings
  11. Add WordQuest Words
  12. Add Wishes

  - UPDATE:
  100. Update player title rarities
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
      case "10":
        await addGameSettings();
        break;
      case "11":
        await addWordQuestWords();
        break;
      case "12":
        await addWishes();
        break;
      case "100":
        await updatePlayerTitleRarities();
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
      data: guilds.map((guild) => ({
        ...guild,
        schoolClass: guild.schoolClass as SchoolClass,
      })),
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
      const { type, ...rest } = ability;
      await db.ability.upsert({
        where: { id: ability.id },
        update: {
          ...rest,
          type: type as AbilityType,
        },
        create: {
          ...rest,
          type: type as AbilityType,
        },
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
        where: { id: cosmic.id },
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
      const { classReq, ...rest } = item;
      await db.shopItem.upsert({
        where: { id: item.id },
        update: {
          ...rest,
          classReq: classReq as Class,
        },
        create: {
          ...rest,
          classReq: classReq as Class,
        },
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
        where: { id: typeQuestText.id },
        update: typeQuestText,
        create: typeQuestText,
      });
    } catch (error) {
      console.error("Error adding", typeQuestText.text + ": ", error);
    }
  }
  console.info("Type quest texts have been added to the database.");
}

async function addWordQuestWords() {
  for (const word of wordQuestWords) {
    try {
      await db.wordQuestWord.upsert({
        where: { id: word.id },
        update: word,
        create: word,
      });
    } catch (error) {
      console.error("Error adding", word.word + ": ", error);
    }
  }
  console.info("Word quest words have been added to the database.");
}

async function addEnemies() {
  for (const enemy of enemies) {
    try {
      await db.enemy.upsert({
        where: { id: enemy.id },
        update: enemy,
        create: enemy,
      });
    } catch (error) {
      console.error("Error adding", enemy + ": ", error);
    }
  }
  console.info("Enemies has been added to the database.");
}

async function addGameSettings() {
  for (const setting of gameSettings) {
    try {
      await db.applicationSettings.createMany({
        data: setting,
        skipDuplicates: true,
      });
    } catch (error) {
      console.error("Error adding", setting + ": ", error);
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

async function addWishes() {
  for (const wish of wishes) {
    try {
      await db.wish.upsert({
        where: { id: wish.id },
        update: wish,
        create: wish,
      });
    } catch (error) {
      console.error("Error adding", wish.name + ": ", error);
    }
  }
  console.info("Wishes have been added to the database.");
}

async function updatePlayerTitleRarities() {
  try {
    const titles = await db.shopItem.findMany({
      select: {
        name: true,
        rarity: true,
      },
    });

    for (const { name, rarity } of titles) {
      await db.user.updateMany({
        where: { title: name },
        data: { titleRarity: rarity as $Enums.Rarity },
      });
    }

    console.info(
      "Player title rarities have been updated based on shop items.",
    );
  } catch (error) {
    console.error("Error updating player title rarities: ", error);
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
  await addGameSettings();
  await addWordQuestWords();
  await addWishes();
}

async function addAllWithoutUsers() {
  await addGuilds();
  await addAbilities();
  await addCosmicEvents();
  await addShopItems();
  await addTypeQuestTexts();
  await addEnemies();
  await addGameSettings();
  await addWordQuestWords();
  await addWishes();
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
