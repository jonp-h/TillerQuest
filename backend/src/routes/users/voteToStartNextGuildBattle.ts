import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireUserIdAndActive } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import { ErrorMessage } from "../../lib/error.js";
import { validateBody } from "middleware/validationMiddleware.js";
import { guildNameParamSchema } from "utils/validators/validationUtils.js";

interface VoteToStartNextBattleRequest extends AuthenticatedRequest {
  params: {
    userId: string;
  };
  body: {
    guildName: string;
  };
}

export const voteToStartNextBattle = [
  requireUserIdAndActive(),
  validateBody(guildNameParamSchema),
  async (req: VoteToStartNextBattleRequest, res: Response) => {
    try {
      const userId = req.params.userId;
      const guildName = req.body.guildName;

      await db.$transaction(async (tx) => {
        const guild = await tx.guild.findFirst({
          where: {
            name: guildName,
            members: { some: { id: userId } },
          },
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

        await tx.guild.update({
          where: { id: guild.id },
          data: {
            nextBattleVotes: [...guild.nextBattleVotes, userId],
          },
        });

        // +1 because the current vote isn't in the array yet
        // -1 because the guild leader doesn't vote
        const newVoteCount = guild.nextBattleVotes.length + 1;
        const requiredVotes = guild.members.length - 1;
        let battleReady = false;

        if (newVoteCount >= requiredVotes && guild.enemies.length > 0) {
          // Enable the guild leader to start the battle by removing all enemies
          await tx.guild.update({
            where: { name: guild.name },
            data: {
              level: {
                increment: 1, // Increment guild level by 1
              },
            },
          });

          await tx.guildEnemy.deleteMany({
            where: { guildName: guild.name },
          });

          battleReady = true;
        }

        res.json({
          success: true,
          data: {
            message: "Vote registered to start next battle!",
            voteCount: newVoteCount,
            requiredVotes,
            battleReady,
          },
        });
      });
    } catch (error) {
      if (error instanceof ErrorMessage) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
        return;
      }

      logger.error("Error voting to start next guild battle: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to register vote",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
