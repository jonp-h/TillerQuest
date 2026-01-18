import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireActiveUser } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import { ErrorMessage } from "../../lib/error.js";
import z from "zod";
import {
  validateBody,
  validateParams,
} from "../../middleware/validationMiddleware.js";
import { DiceRoll, exportFormats } from "@dice-roller/rpg-dice-roller";
import { gameIdParamSchema } from "utils/validators/validationUtils.js";

const rollBinaryJackDiceSchema = z.object({
  dice: z.enum(["d4", "d6", "d8", "d10", "d20"]),
});

export const rollBinaryJackDice = [
  requireActiveUser,
  validateParams(gameIdParamSchema),
  validateBody(rollBinaryJackDiceSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const gameId = req.params.gameId;
      const { dice } = req.body;

      const game = await db.game.findUnique({
        where: {
          id: gameId,
          status: "INPROGRESS",
          userId: req.session!.user.id,
        },
      });

      if (!game) {
        throw new ErrorMessage("Invalid game session");
      }

      // Get game metadata and validate dice choice
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let metadata: any = game.metadata || {};
      if (typeof metadata === "string") {
        try {
          metadata = JSON.parse(metadata);
        } catch {
          metadata = {};
        }
      }

      const availableDice = metadata.availableDice || [];
      if (!availableDice.includes(dice)) {
        throw new ErrorMessage("Die not available for this round");
      }

      const roll = new DiceRoll(dice);
      // @ts-expect-error - the package's export function is not typed correctly
      const rolledValue = roll.export(exportFormats.OBJECT) as {
        averageTotal: number;
        maxTotal: number;
        minTotal: number;
        notation: string;
        output: string;
        total: number;
        type: string;
      };

      await db.game.update({
        where: { id: gameId },
        data: {
          metadata: {
            ...metadata,
            rolledValue: rolledValue.total,
          },
        },
      });

      res.json({
        success: true,
        data: {
          rolledValue: rolledValue.total,
          diceRoll: rolledValue.output.split("[")[1].split("]")[0],
        },
      });
    } catch (error) {
      if (error instanceof ErrorMessage) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
        return;
      }

      logger.error("Error rolling BinaryJack dice: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to roll BinaryJack dice",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
