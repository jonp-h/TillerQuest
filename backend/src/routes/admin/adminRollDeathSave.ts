import { Response } from "express";
import { logger } from "../../lib/logger.js";
import { requireAuth, requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import { DiceRoll, exportFormats } from "@dice-roller/rpg-dice-roller";

export const adminRollDeathSave = [
  requireAuth,
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const roll = new DiceRoll("1d6");
      // @ts-expect-error - the package's export function is not typed correctly
      const rollData = roll.export(exportFormats.OBJECT) as {
        output: string;
        total: number;
      };

      res.json({
        success: true,
        data: {
          roll: rollData.total,
          diceRoll: rollData.output.split("[")[1].split("]")[0],
        },
      });
    } catch (error) {
      logger.error("Error rolling death save: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to roll death save",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
