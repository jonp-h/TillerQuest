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
  applyBinaryOperationSchema,
  gameIdParamSchema,
} from "utils/validators/validationUtils.js";

const BINARY_JACK_MAX_TURNS = 6;

export const applyBinaryOperation = [
  requireActiveUser,
  validateParams(gameIdParamSchema),
  validateBody(applyBinaryOperationSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const gameId = req.params.gameId;
      const { operation } = req.body;

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

      // Get game metadata
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let metadata: any = game.metadata || {};
      if (typeof metadata === "string") {
        try {
          metadata = JSON.parse(metadata);
        } catch {
          metadata = {};
        }
      }

      const targetNumber = metadata.targetNumber;
      const availableOperations = metadata.availableOperations || [];
      const currentValue = metadata.currentValue;
      const rolledValue = metadata.rolledValue;
      if (targetNumber === undefined) {
        throw new ErrorMessage("Game not properly initialized");
      }

      // validate if diceValue exists in metadata
      if (rolledValue === undefined || rolledValue === null) {
        throw new ErrorMessage("No rolled value found for this round");
      }

      // Validate operation against round's available operations
      if (!availableOperations.includes(operation)) {
        throw new ErrorMessage("Operation not available for this round");
      }

      // Calculate the new value based on the binary operation
      let newValue = 0;
      switch (operation) {
        case "AND":
          newValue = currentValue & rolledValue;
          break;
        case "OR":
          newValue = currentValue | rolledValue;
          break;
        case "XOR":
          newValue = currentValue ^ rolledValue;
          break;
        case "NAND":
          newValue = ~(currentValue & rolledValue) & 0x1f; // Mask to 5 bits
          break;
        case "NOR":
          newValue = ~(currentValue | rolledValue) & 0x1f; // Mask to 5 bits
          break;
        case "XNOR":
          newValue = ~(currentValue ^ rolledValue) & 0x1f; // Mask to 5 bits
          break;
        default:
          throw new ErrorMessage("Invalid binary operation");
      }

      // Update game metadata with the new value and increment turn count
      const newMetadata = {
        ...metadata,
        currentValue: newValue,
        turns: (metadata.turns || 0) + 1,
        lastOperation: operation,
        rolledValue: null,
      };

      await db.game.update({
        where: { id: gameId },
        data: {
          metadata: newMetadata,
        },
      });

      res.json({
        success: true,
        data: {
          newValue,
          hitTarget: newValue === targetNumber,
          turnsRemaining: Math.max(
            0,
            BINARY_JACK_MAX_TURNS - newMetadata.turns,
          ),
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

      logger.error("Error applying binary operation: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to apply binary operation",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
