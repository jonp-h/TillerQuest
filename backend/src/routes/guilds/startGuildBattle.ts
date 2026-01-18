import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireActiveUser } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import { ErrorMessage } from "../../lib/error.js";
import { validateParams } from "middleware/validationMiddleware.js";
import { guildNameParamSchema } from "utils/validators/validationUtils.js";
import { addLog } from "utils/logs/addLog.js";

export const startGuildBattle = [
  requireActiveUser,
  validateParams(guildNameParamSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const guildName = req.params.guildName;
      const userId = req.session!.user.id;

      await db.$transaction(async (tx) => {
        const guild = await tx.guild.findFirst({
          where: {
            name: guildName,
            guildLeader: userId,
            members: { some: { id: userId } },
          },
          select: {
            id: true,
            name: true,
            level: true,
            _count: {
              select: {
                members: true,
              },
            },
          },
        });

        if (!guild) {
          throw new ErrorMessage("Only the guild leader can start a battle.");
        }

        const totalEnemies = await tx.enemy.count();
        const randomOffset = Math.floor(Math.random() * totalEnemies);

        const enemy = await tx.enemy.findFirst({
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

        const maxHealth = Math.floor(
          Math.sqrt(guild.level) * 12 * guild._count.members,
        );
        const attack = Math.floor(Math.sqrt(guild.level) + 0.5);
        const xp = Math.floor(Math.sqrt(guild.level) * 80);
        const gold = Math.floor(guild.level * 50);

        // Number of enemies scales with guild level: 1 at low levels, up to 5 at high levels
        const maxEnemies = 5;
        // Use sqrt(level) to bias towards more enemies at higher levels
        const levelFactor = Math.sqrt(guild.level);
        // Clamp between 1 and maxEnemies
        const numberOfEnemies = Math.min(
          maxEnemies,
          1 + Math.floor(levelFactor),
        );

        const enemyHealth = Math.floor(maxHealth / numberOfEnemies);
        const enemyXp = Math.floor(xp / numberOfEnemies);
        const enemyGold = Math.floor(gold / numberOfEnemies);

        for (let i = 0; i < numberOfEnemies; i++) {
          await tx.guildEnemy.create({
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

        await tx.guild.update({
          where: { name: guild.name },
          data: { nextBattleVotes: [] }, // reset next battle votes after a battle is started
        });

        // TODO: Consider re-adding guild enemy attack when starting battles

        await addLog(
          tx,
          userId,
          `DUNGEON: ${guild.name} has started a guild battle against ${enemy.name}.`,
        );

        res.json({
          success: true,
          data: `Battle started against ${enemy.name}!`,
        });
      });
    } catch (error) {
      if (error instanceof ErrorMessage) {
        res.status(403).json({
          success: false,
          error: error.message,
        });
        return;
      }

      logger.error("Error starting guild battle: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to start guild battle",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
