import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireActiveUser } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import { validateParams } from "middleware/validationMiddleware.js";
import { userIdParamSchema } from "utils/validators/validationUtils.js";

export const getUserTurns = [
  requireActiveUser,
  validateParams(userIdParamSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.params.userId;

      const turns = await db.user.findFirst({
        where: { id: userId },
        select: {
          turns: true,
        },
      });

      res.json({
        success: true,
        data: turns?.turns || 0,
      });
    } catch (error) {
      logger.error("Error fetching user turns: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch user turns",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
