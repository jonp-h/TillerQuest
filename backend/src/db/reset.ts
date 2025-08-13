import { PrismaClient, SchoolClass } from "@prisma/client";
import guilds from "./guilds.js";
import { PrismaTransaction } from "../types/prismaTransaction.js";

// Initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  console.log(`
  Please choose an option:
  DANGERZONE:
  1 - normal reset. Set all users to the NEW role. Only Gemstones, passives, abilities, and guilds are reset.
  2 - soft reset with shop items. Resets all abilities and passives, and refunds shop items. Does not set NEW role or reset guilds.
  3 - single normal reset. Reset a single user
  4 - delete non-consenting VG2 users. Reset all VG2 users who has not consented to archiving
  `);

  process.stdin.setEncoding("utf8");

  process.stdin.on("data", async (input) => {
    const answer = input.toString().trim(); // Trim whitespace and newlines

    switch (answer) {
      case "1":
        console.log(
          "Are you sure you want to reset all users? Type 'yes' to confirm:",
        );
        process.stdin.once("data", async (confirmation) => {
          if (confirmation.toString().trim().toLowerCase() === "yes") {
            console.log("Resetting all users...");
            await resetUsers();
          } else {
            console.log("Operation canceled.");
          }
          process.stdin.pause(); // Stop listening for input after handling this case
        });
        break;
      case "2":
        console.log(
          "Are you sure you want to reset all users and their shop items? Type 'yes' to confirm:",
        );
        process.stdin.once("data", async (confirmation) => {
          if (confirmation.toString().trim().toLowerCase() === "yes") {
            console.log("Resetting all users...");
            await resetUsersAndShopItems();
          } else {
            console.log("Operation canceled.");
          }
          process.stdin.pause(); // Stop listening for input after handling this case
        });
        break;
      case "3":
        console.log("Enter username of user to reset:");
        process.stdin.once("data", async (username) => {
          const trimmedUsername = username.toString().trim();
          console.log(
            `Are you sure you want to reset the user "${trimmedUsername}"? Retype the username to confirm:`,
          );
          process.stdin.once("data", async (confirmation) => {
            if (confirmation.toString().trim() === trimmedUsername) {
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
          if (confirmation.toString().trim().toLowerCase() === "yes") {
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
              ability: {
                select: {
                  gemstoneCost: true,
                },
              },
            },
          },
        },
        where: {
          role: {
            notIn: ["ARCHIVED", "ADMIN"],
          },
        },
      });

      for (const user of users) {
        await normalResetUserHandler(db, user);
      }

      // Remove and recreate guilds
      await db.guild.deleteMany({
        where: {
          archived: false,
        },
      });
      await db.guild.createMany({
        data: guilds.map((g) => ({
          name: g.name,
          schoolClass: g.schoolClass as SchoolClass,
        })),
        skipDuplicates: true,
      });
    });
    console.info(
      "All users have been set to NEW. Gemstones, classes, passives, abilities and guilds have been reset.",
    );
  } catch (error) {
    console.error("Error: ", error);
  }
}

// local helper function to reset a single user
async function normalResetUserHandler(
  db: PrismaTransaction,
  user: {
    id: string;
    mana: number;
    abilities: {
      ability: {
        gemstoneCost: number;
      };
      id: string;
    }[];
  },
) {
  let totalGemstoneCost = 0;
  for (const ability of user.abilities) {
    totalGemstoneCost += ability.ability.gemstoneCost;
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      role: "NEW",
      hp: 40,
      hpMax: 40,
      mana: Math.min(user.mana, 40),
      manaMax: 40,
      gemstones: {
        increment: totalGemstoneCost,
      },
      class: null,
      guildName: null,
      games: {
        deleteMany: {
          userId: user.id,
        },
      },
      logs: {
        create: {
          global: false,
          message: `RESET: Your account has been reset. You have been refunded ${totalGemstoneCost} gemstones.`,
        },
      },
      title: "Newborn",
      titleRarity: "Common",
      sessions: {
        deleteMany: {
          userId: user.id,
        },
      },
      passives: {
        deleteMany: {
          userId: user.id,
        },
      },
      access: {
        set: [],
      },
      abilities: {
        deleteMany: {
          userId: user.id,
        },
      },
    },
  });
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
              ability: {
                select: {
                  gemstoneCost: true,
                },
              },
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
        await softResetUserHandler(db, user);
      }
    });
    console.info(
      "All users has had their gemstones, passives, shopitems and abilities reset. Users have not been set to the NEW role.",
    );
  } catch (error) {
    console.error("Error: ", error);
  }
}

// local helper function to reset a single user
async function softResetUserHandler(
  db: PrismaTransaction,
  user: {
    id: string;
    hp: number;
    mana: number;
    inventory: {
      price: number;
    }[];
    abilities: {
      id: string;
      ability: {
        gemstoneCost: number;
      };
    }[];
  },
) {
  let totalGemstoneCost = 0;
  for (const ability of user.abilities) {
    totalGemstoneCost += ability.ability.gemstoneCost;
  }

  let goldFromShopItems = 0;
  for (const shopItem of user.inventory) {
    goldFromShopItems += shopItem.price;
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
        increment: totalGemstoneCost,
      },
      gold: {
        increment: goldFromShopItems,
      },
      title: "Newborn",
      titleRarity: "Common",
      sessions: {
        deleteMany: {
          userId: user.id,
        },
      },
      passives: {
        deleteMany: {
          userId: user.id,
        },
      },
      access: {
        set: [],
      },
      abilities: {
        deleteMany: {
          userId: user.id,
        },
      },
      inventory: {
        deleteMany: {},
      },
      logs: {
        create: {
          global: false,
          message: `RESET: Your shopitems and abilities have been reset. You have been refunded ${totalGemstoneCost} gemstones and ${goldFromShopItems} gold.`,
        },
      },
    },
  });
}

async function resetSingleUser(username: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { username: username },
      select: {
        id: true,
        mana: true,
        abilities: {
          select: {
            id: true,
            ability: {
              select: {
                gemstoneCost: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      console.error(`User with username "${username}" not found.`);
      return;
    }

    await normalResetUserHandler(prisma, user);

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

      // Find consenting users and their guilds
      const consentingUsers = await db.user.findMany({
        where: {
          AND: [
            { archiveConsent: true },
            { role: "USER" },
            {
              schoolClass: {
                in: ["Class_2IT1", "Class_2IT2", "Class_2IT3", "Class_2MP1"],
              },
            },
          ],
        },
        select: {
          id: true,
          guildName: true,
        },
      });

      // Archive the users
      await db.user.updateMany({
        where: {
          AND: [
            { archiveConsent: true },
            { role: "USER" },
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

      // Archive their guilds (if any)
      const guildNames = [
        ...new Set(
          consentingUsers
            .map((u) => u.guildName)
            .filter((name): name is string => !!name),
        ),
      ];
      if (guildNames.length > 0) {
        await db.guild.updateMany({
          where: {
            name: { in: guildNames },
          },
          data: {
            archived: true,
          },
        });
      }

      await db.user.deleteMany({
        where: {
          role: "NEW",
        },
      });
    });
    console.info(
      "All NEW users and all non-consenting VG2 users have been deleted. Consenting users and guilds have been archived.",
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
