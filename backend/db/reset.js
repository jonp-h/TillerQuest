import { PrismaClient } from "@prisma/client";
import readline from "readline";

// Initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const options = `
  Please choose an option:
  DANGERZONE:
  reset. Set all users to NEW
  `;

  rl.question(options, async (answer) => {
    switch (answer) {
      case "reset":
        await resetUsers();
        break;
      default:
        console.log("Invalid option");
    }
    rl.close();
  });
}

async function resetUsers() {
  try {
    await prisma.$transaction(async (db) => {
      const users = await db.user.findMany({
        select: {
          id: true,
          mana: true,
          abilities: {
            select: {
              id: true,
            },
          },
        },
      });

      for (const user of users) {
        const abilitiesRemoved = user.abilities.length;
        const gemstonesToAdd = abilitiesRemoved * 2;

        await db.user.update({
          where: { id: user.id },
          data: {
            role: "NEW",
            hp: 40,
            hpMax: 40,
            mana: Math.min(user.mana, 40),
            manaMax: 40,
            gemstones: {
              increment: gemstonesToAdd,
            },
            passives: {
              deleteMany: {
                userId: user.id,
              },
            },
            abilities: {
              deleteMany: {
                userId: user.id,
              },
            },
          },
        });
      }
    });
    console.info(
      "All users have been set to NEW. Only Gemstones, passives and abilities have been reset.",
    );
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
    await prisma.$disconnect();
  });
