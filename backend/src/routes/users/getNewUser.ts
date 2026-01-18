import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireUserId } from "../../middleware/authMiddleware.js";
import { validateParams } from "middleware/validationMiddleware.js";
import { userIdParamSchema } from "utils/validators/validationUtils.js";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";

export const getNewUser = [
  requireUserId(),
  validateParams(userIdParamSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.params.userId;
      const user = await db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          username: true,
          lastname: true,
          publicHighscore: true,
        },
      });

      res.json({ success: true, data: user });
    } catch (error) {
      logger.error("Error fetching create user by ID: " + error);

      res.status(500).json({
        success: false,
        error: "Failed to fetch user",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
