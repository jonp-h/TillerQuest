import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireActiveUser } from "../../middleware/authMiddleware.js";
import { validateParams } from "middleware/validationMiddleware.js";
import { userIdParamSchema } from "utils/validators/validationUtils.js";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";

export const getGameUser = [
  requireActiveUser,
  validateParams(userIdParamSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.params.userId;
      const user = await db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          arenaTokens: true,
          access: true,
          gold: true,
        },
      });

      res.json({ success: true, data: user });
    } catch (error) {
      logger.error("Error fetching game user by ID: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch user",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
