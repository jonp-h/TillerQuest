import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  const abilitiesPath = path.join(__dirname, "abilities.json");
  const abilitiesData = JSON.parse(fs.readFileSync(abilitiesPath, "utf-8"));
  const usersPath = path.join(__dirname, "users.json");
  const usersData = JSON.parse(fs.readFileSync(usersPath, "utf-8"));
  const guildsPath = path.join(__dirname, "guilds.json");
  const guildsData = JSON.parse(fs.readFileSync(guildsPath, "utf-8"));

  // for (const guild of guildsData) {
  //   await prisma.guild.create({
  //     data: {
  //       name: guild.name,
  //     },
  //   });
  // }
  console.info("Guilds have been added to the database.");

  for (const user of usersData) {
    await prisma.user.create({
      data: {
        id: user.id,
        username: user.username,
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        image: user.image,
        hp: user.hp,
        hpMax: user.hpMax,
        mana: user.mana,
        manaMax: user.manaMax,
        level: user.level,
        guildName: user.guildName,
        role: user.role,
        class: user.class,
      },
    });
  }
  console.info("Users have been added to the database.");

  //   for (const ability of abilitiesData) {
  //     await prisma.ability.create({
  //       data: {
  //         name: ability.name,
  //         type: ability.type,
  //         isPassive: ability.isPassive,
  //         description: ability.description,
  //         duration: ability.duration || null,
  //         icon: ability.icon || null,
  //         cost: ability.cost || null,
  //         xpGiven: ability.xpGiven || null,
  //         value: ability.value || null,
  //         parentAbility: ability.parentAbility || null,
  //       },
  //     });
  //   }
  //   console.info("Abilities have been added to the database.");
}

// Run the main function and handle any errors
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
