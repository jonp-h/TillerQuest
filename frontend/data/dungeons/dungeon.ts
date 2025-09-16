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
import { ServerActionResult } from "@/types/serverActionResult";

export const startGuildBattle = async (
  userId: string,
): Promise<ServerActionResult> => {
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

      // TODO: Consider re-adding guild enemy attack when starting battles

      await addLog(
        db,
        userId,
        `DUNGEON: ${guild.name} has started a guild battle against ${enemy.name}.`,
      );

      return {
        success: true,
        data: `Battle started against ${enemy.name}!`,
      };
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn(
        "Unauthorized access attempt to start guild battle for user: " + userId,
      );
      return {
        success: false,
        error: error.message,
      };
    }

    if (error instanceof ErrorMessage) {
      return {
        success: false,
        error: error.message,
      };
    }

    logger.error("Error starting guild battle: " + error);
    return {
      success: false,
      error:
        "Something went wrong while starting the guild battle. Please inform a game master of this timestamp: " +
        Date.now().toLocaleString("no-NO"),
    };
  }
};

export const voteToStartNextBattle = async (
  userId: string,
): Promise<ServerActionResult> => {
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

      return {
        success: true,
        data: `Vote registered to start next battle!`,
      };
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn(
        "Unauthorized vote attempt to start next guild battle for user: " +
          userId,
      );
      return {
        success: false,
        error: error.message,
      };
    }

    if (error instanceof ErrorMessage) {
      return {
        success: false,
        error: error.message,
      };
    }

    logger.error("Error voting to start next guild battle: " + error);
    return {
      success: false,
      error:
        "Something went wrong while voting to start the next guild battle. Please inform a game master of this timestamp: " +
        Date.now().toLocaleString("no-NO"),
    };
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
