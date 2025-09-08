"use server";

import { db } from "@/lib/db";
import { addLog } from "../log/addLog";
import { logger } from "@/lib/logger";
import {
  AuthorizationError,
  validateActiveUserAuth,
  validateUserIdAndActiveUserAuth,
} from "@/lib/authUtils";
import { ErrorMessage } from "@/lib/error";
import { damageValidator } from "../validators/validators";

export const startGuildBattle = async (userId: string) => {
  await validateUserIdAndActiveUserAuth(userId);

  try {
    return await db.$transaction(async (db) => {
      const guild = await db.guild.findFirst({
        where: { guildLeader: userId, members: { some: { id: userId } } },
      });

      if (!guild) {
        throw new ErrorMessage("Only the guild leader can start a battle.");
      }

      const totalEnemies = await db.enemy.count();
      const randomOffset = Math.floor(Math.random() * totalEnemies);

      const enemy = await db.enemy.findFirst({
        select: {
          id: true,
          name: true,
          icon: true,
        },
        orderBy: {
          name: "asc",
        },
        skip: randomOffset,
      });

      if (!enemy) {
        throw new Error("No enemy found for the battle.");
      }

      const maxHealth = Math.floor(Math.sqrt(guild.level) * 12 * 5);
      const attack = Math.floor(Math.sqrt(guild.level) + 0.5);
      const xp = Math.floor(Math.sqrt(guild.level) * 80);
      const gold = Math.floor(guild.level * 50);

      // Number of enemies scales with guild level: 1 at low levels, up to 4 at high levels
      const maxEnemies = 5;
      // Use sqrt(level) to bias towards more enemies at higher levels
      const levelFactor = Math.sqrt(guild.level);
      // Clamp between 1 and maxEnemies
      const numberOfEnemies = Math.min(maxEnemies, 1 + Math.floor(levelFactor));

      const enemyHealth = Math.floor(maxHealth / numberOfEnemies);
      const enemyXp = Math.floor(xp / numberOfEnemies);
      const enemyGold = Math.floor(gold / numberOfEnemies);

      for (let i = 0; i < numberOfEnemies; i++) {
        await db.guildEnemy.create({
          data: {
            guildName: guild.name,
            enemyId: enemy.id,
            icon: enemy.icon,
            name: enemy.name,
            health: enemyHealth,
            maxHealth: enemyHealth,
            attack: attack,
            xp: enemyXp,
            gold: enemyGold,
          },
        });
      }

      await db.guild.update({
        where: { name: guild.name },
        data: { nextBattleVotes: [] }, // reset next battle votes after a battle is started
      });

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const guildEnemies = await db.guildEnemy.findMany({
        where: { health: { gt: 0 } },
        select: {
          guildName: true,
          name: true,
          attack: true,
        },
      });

      // Sum attack per guild for analytics
      const guildAttackTotals = guildEnemies.reduce<Record<string, number>>(
        (acc, enemy) => {
          acc[enemy.guildName] = (acc[enemy.guildName] || 0) + enemy.attack;
          return acc;
        },
        {},
      );

      // Add sum to analytics
      await Promise.all(
        Object.entries(guildAttackTotals).map(([guildName, totalAttack]) =>
          db.analytics.create({
            data: {
              triggerType: "dungeon_damage",
              guildName,
              value: totalAttack,
            },
          }),
        ),
      );

      // Damage each user in the guilds with active enemies. Only target users who have been active today.
      for (const enemy of guildEnemies) {
        const users = await db.user.findMany({
          where: {
            guildName: enemy.guildName,
            // TODO: consider removing manafetching safeguard
            lastMana: { gte: startOfToday },
          },
          select: { id: true, username: true, hp: true, class: true },
        });

        await Promise.all(
          users.map(async (user) => {
            const damageToTake = await damageValidator(
              db,
              user.id,
              user.hp,
              enemy.attack,
              user.class,
            );
            await db.user.update({
              where: { id: user.id },
              data: { hp: { decrement: damageToTake } },
            });
            await db.log.create({
              data: {
                global: false,
                userId: user.id,
                message: `${user.username} took ${damageToTake} damage when fighting alongside their guildmates in the dungeon.`,
              },
            });
          }),
        );
      }

      await addLog(
        db,
        userId,
        `DUNGEON: ${guild.name} has started a guild battle against ${enemy.name}.`,
      );

      return `Battle started against ${enemy.name}!`;
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn(
        "Unauthorized access attempt to start guild battle for user: " + userId,
      );
      throw error;
    }

    if (error instanceof ErrorMessage) {
      throw error;
    }

    logger.error("Error starting guild battle: " + error);
    throw new Error(
      "Something went wrong while starting the guild battle. Please inform a game master of this timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

export const voteToStartNextBattle = async (userId: string) => {
  await validateUserIdAndActiveUserAuth(userId);

  try {
    return await db.$transaction(async (db) => {
      const guild = await db.guild.findFirst({
        where: { members: { some: { id: userId } } },
        include: {
          members: { select: { id: true } },
          enemies: { select: { id: true } },
        },
      });

      if (!guild) {
        throw new ErrorMessage("Only guild members can vote.");
      }

      if (guild.nextBattleVotes.includes(userId)) {
        throw new ErrorMessage("You have already voted.");
      }

      await db.guild.update({
        where: { id: guild.id },
        data: {
          nextBattleVotes: [...guild.nextBattleVotes, userId],
        },
      });

      if (
        guild.nextBattleVotes.length + 1 >= guild.members.length - 1 &&
        guild.enemies.length > 0
      ) {
        // +1 because the current vote isn't in the array yet
        // -1 because the guild leader doesn't vote

        // enable the guild leader to start the battle by removing all enemies
        await db.guild.update({
          where: { name: guild.name },
          data: {
            level: {
              increment: 1, // Increment guild level by 1
            },
          },
        });

        await db.guildEnemy.deleteMany({
          where: { guildName: guild.name },
        });
      }

      return `Vote registered to start next battle!`;
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn(
        "Unauthorized vote attempt to start next guild battle for user: " +
          userId,
      );
      throw error;
    }

    if (error instanceof ErrorMessage) {
      throw error;
    }

    logger.error("Error voting to start next guild battle: " + error);
    throw new Error(
      "Something went wrong while voting to start the next guild battle. Please inform a game master of this timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

export const getEnemies = async (userId: string) => {
  try {
    await validateActiveUserAuth();

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        guildName: true, // Select the guildName
      },
    });

    if (!user?.guildName) {
      logger.warn(
        "User " + userId + " is not in a guild. Tried to fetch enemy.",
      );
      return null;
    }

    const enemy = await db.guildEnemy.findMany({
      where: {
        guildName: user.guildName,
      },
      select: {
        id: true,
        icon: true,
        maxHealth: true,
        enemyId: true,
        attack: true,
        guildName: true,
        health: true,
        name: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    return enemy;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn(
        "Unauthorized access attempt to get enemies for user: " + userId,
      );
      throw error;
    }

    logger.error("Error fetching enemy: " + error);
    throw new Error(
      "Error fetching enemy. Please inform a game master of this timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

export async function getUserTurns(userId: string) {
  try {
    await validateActiveUserAuth();

    const turns = await db.user.findFirst({
      where: { id: userId },
      select: {
        turns: true,
      },
    });
    return turns || { turns: 0 };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access attempt to get user turns: " + userId);
      throw error;
    }

    logger.error("Error checking turn: " + error);
    return { turns: 0 };
  }
}

// export async function selectDungeonAbility(
//   userId: string,
//   ability: Ability,
//   targetEnemyId: string | null,
// ) {
//   try {
//     await validateUserIdAndActiveUserAuth(userId);

//     const abilityName = ability.name;

//     return await db.$transaction(async (db) => {
//       const user = await db.user.findUnique({
//         where: { id: userId },
//         select: {
//           id: true,
//           username: true,
//           hp: true,
//           guildName: true,
//           turns: true,
//         },
//       });

//       if (!user || !user?.guildName || targetEnemyId === null) {
//         logger.error("Error when attempting to use dungeon ability: " + userId);
//         return { message: "Error when attempting to use dungeon ability" };
//       }

//       if (user.hp <= 0) {
//         return { message: "You are dead." };
//       }

//       if (user?.turns <= 0) {
//         return { message: "You have no turns left!" };
//       }

//       const userOwnsAbility = await db.userAbility.findFirst({
//         where: { userId: user.id, abilityName },
//       });

//       if (!userOwnsAbility) {
//         return { message: "User doesn't own the ability" };
//       }

//       const ability = await db.ability.findFirst({
//         where: { name: abilityName },
//       });

//       if (!ability) {
//         return { message: "Ability not found" };
//       }

//       const enemy = await db.guildEnemy.findFirst({
//         where: { id: targetEnemyId },
//         select: {
//           health: true,
//         },
//       });

//       if (!enemy || enemy?.health <= 0) {
//         return { message: "The enemy is already dead!" };
//       }

//       // some dungeon abilities cost mana
//       if (ability?.manaCost) {
//         const manaCost = await manaValidator(db, userId, ability.manaCost);
//         await db.user.update({
//           where: { id: userId },
//           data: { mana: { decrement: manaCost } },
//         });
//       }

//       if (user.hp <= (ability.healthCost || 0)) {
//         return {
//           message: "Insufficient health. The cost is " + ability.healthCost,
//         };
//       }

//       if (abilityName === "Slice-And-Dice") {
//         // special case for Slice-And-Dice, which deals half of the enemy's current health as damage

//         const cooldown = await db.userPassive.findFirst({
//           where: {
//             userId: user.id,
//             abilityName: "Slice-And-Dice",
//           },
//         });

//         if (cooldown) {
//           return {
//             message:
//               "Slice-And-Dice is on cooldown. Please wait before using it again.",
//           };
//         }

//         const damage = Math.floor(enemy.health / 2);
//         await damageEnemy(targetEnemyId, damage);

//         await addLog(
//           db,
//           userId,
//           `DUNGEON: ${user.username} used Slice-And-Dice, dealing ${damage} damage.`,
//         );

//         await db.user.update({
//           where: { id: userId },
//           data: { turns: { decrement: 1 } },
//         });

//         return {
//           message: `You used Slice-And-Dice, dealing ${damage} damage!`,
//         };
//       }

//       const critPassive = await getUserPassiveEffect(db, userId, "Crit");

//       if (!ability.diceNotation) {
//         return { message: "An error occured while rolling the dice" };
//       }

//       const diceResult = rollDice(ability?.diceNotation);

//       let damageResult = diceResult.total;
//       if (critPassive > 0) {
//         damageResult = diceResult.total * 2;
//       }

//       await addLog(
//         db,
//         userId,
//         `DUNGEON: ${user.username} finished their turn and rolled ${damageResult} damage.`,
//       );

//       await damageEnemy(targetEnemyId, damageResult);

//       await db.user.update({
//         where: { id: userId },
//         data: { turns: { decrement: 1 } },
//       });

//       // TODO: considering adding analytics to inspect ability usage and effectiveness

//       return {
//         message:
//           critPassive > 0
//             ? "Rolled " +
//               diceResult.total +
//               "! But with crit it turned into " +
//               damageResult
//             : "Rolled " + diceResult.total + "!",
//         diceRoll:
//           "output" in diceResult
//             ? diceResult.output.split("[")[1].split("]")[0]
//             : "",
//       };
//     });
//   } catch (error) {
//     if (error instanceof AuthorizationError) {
//       logger.warn(
//         "Unauthorized access attempt to use dungeon ability: " + userId,
//       );
//       throw error;
//     }

//     logger.error("Error finishing up turn: " + error);
//     return (
//       "Something went wrong. Please inform a game master of this timestamp: " +
//       Date.now().toLocaleString("no-NO")
//     );
//   }
// }

// //TODO: should be moved to lib. Named Roll or rollDice, depending on project availability
// const rollDice = (diceNotation: string) => {
//   const roll = new DiceRoll(diceNotation);
//   // @ts-expect-error - the package's export function is not typed correctly
//   return roll.export(exportFormats.OBJECT) as {
//     averageTotal: number;
//     maxTotal: number;
//     minTotal: number;
//     notation: string;
//     output: string;
//     // rolls: any[];
//     total: number;
//     type: string;
//   };
// };

// async function damageEnemy(targetEnemyId: string, diceResult: number) {
//   return await db.$transaction(async (db) => {
//     const enemy = await db.guildEnemy.update({
//       where: {
//         id: targetEnemyId,
//       },
//       data: { health: { decrement: diceResult } },
//       select: {
//         health: true,
//         guildName: true,
//       },
//     });

//     // rewards are only given when the enemy is killed
//     if (enemy.health <= 0) {
//       await rewardUsers(targetEnemyId, enemy.guildName);
//     }
//   });
// }

// async function rewardUsers(enemyId: string, guild: string) {
//   return await db.$transaction(async (db) => {
//     const users = await db.user.findMany({
//       where: {
//         guildName: guild,
//       },
//     });
//     const rewards = await db.guildEnemy.findFirst({
//       where: { id: enemyId },
//       select: {
//         name: true,
//         xp: true,
//         gold: true,
//         guildName: true,
//       },
//     });

//     if (!rewards) {
//       logger.error("No rewards found for enemy: " + enemyId);
//       return;
//     }

//     for (const user of users) {
//       await experienceAndLevelValidator(db, user, rewards.xp);
//       const goldMultipler = await getUserPassiveEffect(
//         db,
//         user.id,
//         "VictoryGold",
//       );

//       const goldToGive = Math.floor(rewards.gold * (1 + goldMultipler / 100));

//       const manaToGive = await getUserPassiveEffect(db, user.id, "VictoryMana");

//       await db.user.update({
//         where: { id: user.id },
//         data: {
//           gold: { increment: goldToGive },
//           mana: { increment: manaToGive },
//         },
//       });

//       await addLog(
//         db,
//         user.id,
//         `DUNGEON: ${rewards.name} has been slain, ${user.username} gained ${rewards.xp} XP and ${rewards.gold} gold.`,
//       );
//     }

//     await db.analytics.create({
//       data: {
//         triggerType: "dungeon_reward",
//         xpChange: rewards.xp,
//         goldChange: rewards.gold,
//         guildName: rewards.guildName,
//       },
//     });
//   });
// }
