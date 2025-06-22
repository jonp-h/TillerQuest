import { PrismaClient } from "@prisma/client";

// Initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  console.log(`
  Please choose an option:
  DANGERZONE:
  reset. Set all users to NEW
  resetWithShopItems. Resets all abilities and passives, and refunds shop items. Does not set NEW
  single. Reset a single user
  `);

  process.stdin.setEncoding("utf8");

  process.stdin.on("data", async (input) => {
    const answer = input.trim(); // Trim whitespace and newlines

    switch (answer) {
      case "reset":
        console.log(
          "Are you sure you want to reset all users? Type 'yes' to confirm:",
        );
        process.stdin.once("data", async (confirmation) => {
          if (confirmation.trim().toLowerCase() === "yes") {
            console.log("Resetting all users...");
            await resetUsers();
          } else {
            console.log("Operation canceled.");
          }
          process.stdin.pause(); // Stop listening for input after handling this case
        });
        break;
      case "resetWithShopItems":
        console.log(
          "Are you sure you want to reset all users and their shop items? Type 'yes' to confirm:",
        );
        process.stdin.once("data", async (confirmation) => {
          if (confirmation.trim().toLowerCase() === "yes") {
            console.log("Resetting all users...");
            await resetUsersAndShopItems();
          } else {
            console.log("Operation canceled.");
          }
          process.stdin.pause(); // Stop listening for input after handling this case
        });
        break;
      case "single":
        console.log("Enter username of user to reset:");
        process.stdin.once("data", async (username) => {
          const trimmedUsername = username.trim();
          console.log(
            `Are you sure you want to reset the user "${trimmedUsername}"? Retype the username to confirm:`,
          );
          process.stdin.once("data", async (confirmation) => {
            if (confirmation.trim() === trimmedUsername) {
              await resetSingleUser(trimmedUsername);
            } else {
              console.log("Operation canceled. Usernames did not match.");
            }
            process.stdin.pause(); // Stop listening for input after handling this case
          });
        });
        break;
      case "4":
        console.log(
          "Are you sure you want to delete ALL non-consenting VG2 users? Type 'yes' to confirm:",
        );
        process.stdin.once("data", async (confirmation) => {
          if (confirmation.trim().toLowerCase() === "yes") {
            console.log("Resetting all users...");
            await deleteNonConsentingVG2Users();
          } else {
            console.log("Operation canceled.");
          }
          process.stdin.pause(); // Stop listening for input after handling this case
        });
        break;
    }
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

async function resetUsersAndShopItems() {
  try {
    await prisma.$transaction(async (db) => {
      const users = await db.user.findMany({
        select: {
          id: true,
          mana: true,
          hp: true,
          abilities: {
            select: {
              id: true,
            },
          },
          inventory: {
            select: {
              price: true,
            },
          },
        },
      });

      for (const user of users) {
        const abilitiesRemoved = user.abilities.length;
        const gemstonesToAdd = abilitiesRemoved * 2;
        let goldFromShopItems = 0;
        for (const shopItem of user.inventory) {
          if (shopItem.shopItem) {
            goldFromShopItems += shopItem.price;
          }
        }

        await db.user.update({
          where: { id: user.id },
          data: {
            // role: "NEW",
            hp: Math.min(user.hp, 40),
            hpMax: 40,
            mana: Math.min(user.mana, 40),
            manaMax: 40,
            gemstones: {
              increment: gemstonesToAdd,
            },
            gold: {
              increment: goldFromShopItems,
            },
            title: "Newborn",
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
            inventory: {
              deleteMany: {},
            },
          },
        });
      }
    });
    console.info(
      "All users has had their gemstones, passives, shopitems and abilities reset. Users have not been set to the NEW role.",
    );
  } catch (error) {
    console.error("Error: ", error);
  }
}

async function resetSingleUser(username) {
  try {
    const user = await prisma.user.findUnique({
      where: { username: username },
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

    if (!user) {
      console.error(`User with username "${username}" not found.`);
      return;
    }

    const abilitiesRemoved = user.abilities.length;
    const gemstonesToAdd = abilitiesRemoved * 2;

    await prisma.user.update({
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
          deleteMany: {},
        },
        abilities: {
          deleteMany: {},
        },
      },
    });

    console.info(`User with username "${username}" has been reset.`);
  } catch (error) {
    console.error(`Error resetting user with username "${username}": `, error);
  }
}

async function deleteNonConsentingVG2Users() {
  try {
    await prisma.$transaction(async (db) => {
      await db.user.deleteMany({
        where: {
          AND: [
            { archiveConsent: false },
            { role: "USER" },
            {
              schoolClass: {
                in: ["Class_2IT1", "Class_2IT2", "Class_2IT3", "Class_2MP1"],
              },
            },
          ],
        },
      });

      await db.user.updateMany({
        where: {
          AND: [
            { archiveConsent: true },
            {
              role: "USER",
            },
            {
              schoolClass: {
                in: ["Class_2IT1", "Class_2IT2", "Class_2IT3", "Class_2MP1"],
              },
            },
          ],
        },
        data: {
          mana: 0,
          role: "ARCHIVED",
        },
      });

      await db.user.deleteMany({
        where: {
          role: "NEW",
        },
      });
    });
    console.info(
      "All users has had their gemstones, passives, shopitems and abilities reset. Users have not been set to the NEW role.",
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
