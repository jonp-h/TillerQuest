import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireActiveUser } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import { ErrorMessage } from "../../lib/error.js";
import { validateParams } from "../../middleware/validationMiddleware.js";
import { gameIdParamSchema } from "../../utils/validators/validationUtils.js";
import { binaryJackMaxTurns } from "../../gameSettings.js";

export const startBinaryJackRound = [
  requireActiveUser,
  validateParams(gameIdParamSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const gameId = req.params.gameId;

      const game = await db.game.findUnique({
        where: { id: gameId, status: "INPROGRESS" },
      });

      if (!game) {
        throw new ErrorMessage("Invalid game session");
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let metadata: any = game.metadata || {};
      if (typeof metadata === "string") {
        try {
          metadata = JSON.parse(metadata);
        } catch {
          metadata = {};
        }
      }

      // Each turn may only generate one round, preventing free re-rolls of dice/operation choices
      const roundsGenerated = metadata.roundsGenerated || 0;
      if (roundsGenerated >= binaryJackMaxTurns) {
        throw new ErrorMessage("No more rounds can be generated");
      }

      // Rounds, rolls and operations must happen strictly in that order, never repeated
      if (metadata.phase !== "ROUND") {
        throw new ErrorMessage("A round has already been generated");
      }

      // Available dice types and operations
      const allDice = ["d4", "d6", "d8", "d10", "d20"];
      const allOperations = ["AND", "OR", "XOR", "NAND", "NOR", "XNOR"];

      // Randomly select 2 dice and 2 operations
      const selectedDice: string[] = [];
      const selectedOperations: string[] = [];

      // Select 2 random dice
      const diceIndices = new Set<number>();
      while (diceIndices.size < 2) {
        diceIndices.add(Math.floor(Math.random() * allDice.length));
      }
      diceIndices.forEach((index) => selectedDice.push(allDice[index]));

      // Select 2 random operations
      const opIndices = new Set<number>();
      while (opIndices.size < 2) {
        opIndices.add(Math.floor(Math.random() * allOperations.length));
      }
      opIndices.forEach((index) =>
        selectedOperations.push(allOperations[index]),
      );

      const updatedMetadata = {
        ...metadata,
        availableDice: selectedDice,
        availableOperations: selectedOperations,
        roundsGenerated: roundsGenerated + 1,
        phase: "ROLL",
      };

      await db.game.update({
        where: { id: gameId },
        data: { metadata: updatedMetadata },
      });

      res.json({
        success: true,
        data: {
          availableDice: selectedDice,
          availableOperations: selectedOperations,
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

      logger.error("Error starting BinaryJack round: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to start BinaryJack round",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
