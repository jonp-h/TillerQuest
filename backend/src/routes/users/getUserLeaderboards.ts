import { Response } from "express";
import { logger } from "../../lib/logger.js";
import {
  requireActiveUser,
  requireAuth,
} from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";
import {
  getVg1Leaderboard,
  getVg2Leaderboard,
} from "utils/users/getLeaderboards.js";

export const getUserLeaderboards = [
  requireAuth,
  requireActiveUser,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const vg1 = await getVg1Leaderboard();

      const vg2 = await getVg2Leaderboard();

      res.json({ success: true, data: { vg1, vg2 } });
    } catch (error) {
      logger.error("Error fetching leaderboards: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch leaderboards",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
