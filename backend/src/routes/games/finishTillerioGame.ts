import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAdmin } from "../../middleware/authMiddleware.js";
import z from "zod";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import { ErrorMessage } from "../../lib/error.js";
import { addLog } from "../../utils/logs/addLog.js";
import { goldValidator } from "../../utils/abilities/abilityValidators.js";
import { addAnalytics } from "../../utils/analytics/addAnalytics.js";
import { validateBody } from "../../middleware/validationMiddleware.js";

export const finishTillerioGameSchema = z.object({
  playerList: z.array(
    z.object({ userId: z.string(), score: z.number(), survived: z.boolean() }),
  ),
});

interface FinishTillerioGameRequest extends AuthenticatedRequest {
  body: {
    playerList: {
      userId: string;
      score: number;
      survived: boolean;
    }[];
  };
}

// TODO: could be moved to the apps route
export const finishTillerioGame = [
  requireAdmin,
  validateBody(finishTillerioGameSchema),
  async (req: FinishTillerioGameRequest, res: Response) => {
    try {
      console.log(
        "Finishing Tillerio game with player list:",
        req.body.playerList,
      );
      const playerList = req.body.playerList;

      await db.$transaction(async (tx) => {
        // Use Promise.all to await all operations
        await Promise.all(
          playerList.map(async (player) => {
            // Use tx instead of db
            const targetUser = await tx.user.findFirst({
              where: { id: player.userId },
              select: { id: true, username: true, gold: true },
            });

            if (!targetUser) {
              logger.warn(
                `User with ID ${player.userId} not found when finishing Tillerio game`,
              );
              return; // Skip this player
            }

            const game = await tx.game.create({
              data: {
                userId: player.userId,
                game: "TILLERIO",
                score: player.score,
                status: "FINISHED",
              },
            });

            let gold = player.score * 100;
            let message = "";
            if (player.survived) {
              message = `GAME: ${targetUser.username} survived a game of ${game.game}, and received ${gold} gold`;
            } else {
              message = `GAME: ${targetUser.username} finished a game of ${game.game}, and received ${gold} gold`;
            }

            gold = await goldValidator(tx, targetUser.id, gold);

            await tx.user.update({
              where: { id: targetUser.id },
              data: { gold: { increment: gold } },
            });

            await addLog(tx, game.userId, message);

            await addAnalytics(
              tx,
              game.userId,
              req.session!.user.role,
              "game_completion",
              {
                gameId: game.id,
                category: game.game,
                goldChange: gold,
              },
            );
          }),
        );
      });

      // Send response after transaction completes
      res.json({
        success: true,
        data: { message: "Game finished and all players rewarded" },
      });
    } catch (error) {
      if (error instanceof ErrorMessage) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
        return;
      }
      logger.error("Error starting game: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to start game",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
