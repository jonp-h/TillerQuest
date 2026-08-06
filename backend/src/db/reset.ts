import { SchoolClass } from "@tillerquest/prisma/browser";
import guilds from "./guilds.js";
import { PrismaTransaction } from "../types/prismaTransaction.js";
import { resetUserTurns } from "../cronjobs.js";
import { db } from "../lib/db.js";

// Initialize Prisma Client

async function main() {
  console.log(`
  Please choose an option:
  DANGERZONE:
  1 - normal reset. Set all users to the INACTIVE role. Only Gemstone purchases, passives, abilities, and guilds are reset.
  2 - soft reset with shop items. Typically done to fix a backend update. In general shop items should not be reset. This option will resets all abilities and passives, and refund all shop items for active users and admins. Does not set INACTIVE role or reset guilds.
  3 - single normal reset. Reset a single user to INACTIVE role. Only Gemstones, passives, abilities, and guilds are reset.
  4 - delete non-consenting VG2 users and NEW users, as well as archive guilds/users. Reset all VG2 users who has not consented to archiving
  5 - delete all analytics. Reset all analytics data
  6 - reset user turns. Reset the turns for all users to their passives' turn value
  7 - DELETE USER. Delete a single user from the database. This is irreversible and will delete all data associated with the user.

  NOTE: During a summer-reset, you may want to run option 4 first, and lastly 1. This will ensure that all VG2 users are deleted/archived, and all remaining users are set to INACTIVE role.
  Finally, go over first grade users and delete any non-continuing users individually with option 7.
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
          "Are you sure you want to delete ALL non-consenting VG2 users/NEW users? Type 'yes' to confirm:",
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
      case "5":
        console.log(
          "Are you sure you want to delete all analytics? Type 'yes' to confirm:",
        );
        process.stdin.once("data", async (confirmation) => {
          if (confirmation.toString().trim().toLowerCase() === "yes") {
            console.log("Deleting analytics...");
            await deleteAnalytics();
          } else {
            console.log("Operation canceled.");
          }
          process.stdin.pause(); // Stop listening for input after handling this case
        });
        break;
      case "6":
        console.log(
          "Are you sure you want to reset user turns? Type 'yes' to confirm:",
        );
        process.stdin.once("data", async (confirmation) => {
          if (confirmation.toString().trim().toLowerCase() === "yes") {
            console.log("Resetting user turns...");
            await resetUserTurns(db);
          } else {
            console.log("Operation canceled.");
          }
          process.stdin.pause(); // Stop listening for input after handling this case
        });
        break;
      case "7":
        console.log("Enter the username of the user you want to delete:");
        process.stdin.once("data", async (username) => {
          const trimmedUsername = username.toString().trim();
          console.log(
            `Are you sure you want to delete the user "${trimmedUsername}"? This action is irreversible. Type 'yes' to confirm:`,
          );
          process.stdin.once("data", async (confirmation) => {
            if (confirmation.toString().trim().toLowerCase() === "yes") {
              await deleteSingleUser(trimmedUsername);
            } else {
              console.log("Operation canceled.");
            }
            process.stdin.pause(); // Stop listening for input after handling this case
          });
        });
        break;
    }
  });
}

async function resetUsers() {
  try {
    await db.$transaction(async (tx) => {
      const users = await tx.user.findMany({
        select: {
          id: true,
          mana: true,
          inventory: {
            where: {
              currency: "GEMSTONES",
            },
            select: {
              price: true,
            },
          },
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
            notIn: ["ARCHIVED", "ADMIN", "NEW"],
          },
        },
      });

      for (const user of users) {
        await normalResetUserHandler(tx, user);
      }

      // Remove and recreate guilds
      // First delete GuildEnemy records to avoid foreign key constraint violations
      await tx.guildEnemy.deleteMany({
        where: {
          guild: {
            archived: false,
          },
        },
      });

      await tx.guild.deleteMany({
        where: {
          archived: false,
        },
      });
      await tx.guild.createMany({
        data: guilds.map((g) => ({
          name: g.name,
          schoolClass: g.schoolClass as SchoolClass,
        })),
        skipDuplicates: true,
      });
    });
    console.info(
      "All users have been set to INACTIVE. Gemstones, classes, passives, abilities and guilds have been reset.",
    );
  } catch (error) {
    console.error("Error: ", error);
  }
}

// local helper function to reset a single user
async function normalResetUserHandler(
  tx: PrismaTransaction,
  user: {
    id: string;
    mana: number;
    inventory: {
      price: number;
    }[];
    abilities: {
      ability: {
        gemstoneCost: number;
      };
      id: string;
    }[];
  },
) {
  let totalGemstoneCost = 0;
  // Calculate total gemstone cost of owned abilities
  for (const ability of user.abilities) {
    totalGemstoneCost += ability.ability.gemstoneCost;
  }

  // Calculate total gemstone cost of owned shop items
  for (const shopItem of user.inventory) {
    totalGemstoneCost += shopItem.price;
  }

  await tx.user.update({
    where: { id: user.id },
    data: {
      role: "INACTIVE",
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
      inventory: {
        deleteMany: {
          currency: "GEMSTONES",
        },
      },
    },
  });
}

async function resetUsersAndShopItems() {
  try {
    await db.$transaction(async (tx) => {
      const users = await tx.user.findMany({
        where: {
          NOT: {
            role: {
              in: ["ARCHIVED", "NEW"],
            },
          },
        },
        select: {
          id: true,
          mana: true,
          hp: true,
          gold: true,
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
              currency: true,
            },
          },
        },
      });

      for (const user of users) {
        await softResetUserHandler(tx, user);
      }
    });
    console.info(
      "All active users have had their gemstones, passives, shopitems and abilities reset. No roles have been changed.",
    );
  } catch (error) {
    console.error("Error: ", error);
  }
}

// local helper function to reset a single user
async function softResetUserHandler(
  tx: PrismaTransaction,
  user: {
    id: string;
    hp: number;
    mana: number;
    gold: number;
    inventory: {
      price: number;
      currency: "GOLD" | "GEMSTONES";
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

  let gemstonesFromShopItems = 0;
  let goldFromShopItems = 0;
  for (const shopItem of user.inventory) {
    if (shopItem.currency === "GEMSTONES") {
      gemstonesFromShopItems += shopItem.price;
      continue;
    }

    goldFromShopItems += shopItem.price;
  }

  const totalGemstoneRefund = totalGemstoneCost + gemstonesFromShopItems;
  const MAX_POSTGRES_INT = 2147483647;
  const safeGoldIncrement = Math.max(
    0,
    Math.min(goldFromShopItems, MAX_POSTGRES_INT - user.gold),
  );

  await tx.user.update({
    where: { id: user.id },
    data: {
      // role: "NEW", // Do not change role in soft reset
      hp: Math.min(user.hp, 40),
      hpMax: 40,
      mana: Math.min(user.mana, 40),
      manaMax: 40,
      diceColorset: null,
      gemstones: {
        increment: totalGemstoneRefund,
      },
      gold: {
        increment: safeGoldIncrement,
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
          message: `RESET: Your shopitems and abilities have been reset. You have been refunded ${totalGemstoneRefund} gemstones and ${safeGoldIncrement} gold.`,
        },
      },
    },
  });
}

async function resetSingleUser(username: string) {
  try {
    const user = await db.user.findUnique({
      where: { username: username },
      select: {
        id: true,
        mana: true,
        inventory: {
          where: {
            currency: "GEMSTONES",
          },
          select: {
            price: true,
          },
        },
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

    await normalResetUserHandler(db, user);

    console.info(`User with username "${username}" has been reset.`);
  } catch (error) {
    console.error(`Error resetting user with username "${username}": `, error);
  }
}

async function deleteNonConsentingVG2Users() {
  try {
    await db.$transaction(async (tx) => {
      await tx.user.deleteMany({
        where: {
          AND: [
            { archiveConsent: false },
            { role: { in: ["USER", "INACTIVE"] } },
            {
              schoolClass: {
                in: ["Class_2IT1", "Class_2IT2", "Class_2IT3", "Class_2MP1"],
              },
            },
          ],
        },
      });

      // Find consenting users and their guilds
      const consentingUsers = await tx.user.findMany({
        where: {
          AND: [
            { archiveConsent: true },
            { role: { in: ["USER", "INACTIVE"] } },
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
      await tx.user.updateMany({
        where: {
          AND: [
            { archiveConsent: true },
            { role: { in: ["USER", "INACTIVE"] } },
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
        await tx.guild.updateMany({
          where: {
            name: { in: guildNames },
          },
          data: {
            archived: true,
          },
        });
      }

      await tx.user.deleteMany({
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

async function deleteAnalytics() {
  try {
    await db.$transaction(async (tx) => {
      await tx.analytics.deleteMany({});
    });
    console.info("All analytics data has been deleted.");
  } catch (error) {
    console.error("Error: ", error);
  }
}

async function deleteSingleUser(username: string) {
  try {
    await db.$transaction(async (tx) => {
      await tx.user.delete({
        where: {
          username: username,
        },
      });
    });
    console.info("User with username " + username + " has been deleted.");
  } catch (error) {
    console.error("Error: ", error);
  }
}

// Run the main function and handle any errors
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
