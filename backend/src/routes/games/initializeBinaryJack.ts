import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireActiveUser } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import { ErrorMessage } from "../../lib/error.js";
import {
  validateBody,
  validateParams,
} from "../../middleware/validationMiddleware.js";
import {
  gameIdParamSchema,
  initializeBinaryJackSchema,
} from "utils/validators/validationUtils.js";
import { addLog } from "utils/logs/addLog.js";

const BINARY_JACK_MAX_TURNS = 6;

export const initializeBinaryJack = [
  requireActiveUser,
  validateParams(gameIdParamSchema),
  validateBody(initializeBinaryJackSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const gameId = req.params.gameId;
      const { stake } = req.body;

      await db.$transaction(async (tx) => {
        const game = await tx.game.findUnique({
          where: { id: gameId, status: "PENDING" },
          include: { user: { select: { id: true, gold: true } } },
        });

        if (!game) {
          throw new ErrorMessage("Game not found or not in correct state");
        }

        // Generate random target number (1-30 for 5-bit binary)
        const targetNumber = Math.floor(Math.random() * 30) + 1;

        // Validate stake
        if (stake < 1) {
          throw new ErrorMessage("Stake must be at least 1 gold");
        }

        const userGold = game.user.gold;
        const maxStake = Math.floor(userGold * 0.5); // 50% of user's gold

        if (stake > maxStake) {
          throw new ErrorMessage(
            `Stake cannot exceed 50% of your gold (${maxStake} gold)`,
          );
        }

        if (stake > userGold) {
          throw new ErrorMessage("You don't have enough gold for this stake");
        }

        // Deduct the stake from user's gold
        await tx.user.update({
          where: { id: game.userId },
          data: { gold: { decrement: stake } },
        });

        await addLog(
          tx,
          game.userId,
          `GAME: You entered a BinaryJack game with a stake of ${stake} gold`,
          false,
        );

        const metadata = {
          targetNumber,
          currentValue: 0,
          turns: 0,
          maxTurns: BINARY_JACK_MAX_TURNS,
          rolledValue: null,
          stake,
        };

        await tx.game.update({
          where: { id: gameId },
          data: {
            status: "INPROGRESS",
            startedAt: new Date(),
            metadata,
            score: stake, // Store the stake as the initial score
          },
        });

        res.json({
          success: true,
          data: {
            targetNumber,
            currentValue: 0,
            turnsRemaining: BINARY_JACK_MAX_TURNS,
            stake,
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

      logger.error("Error initializing BinaryJack game: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to initialize BinaryJack game",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
