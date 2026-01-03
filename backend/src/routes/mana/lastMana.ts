import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireUserIdAndActive } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";

export const getLastMana = [
  requireUserIdAndActive(),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.session!.user.id;
      const user = await db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          lastMana: true,
        },
      });

      res.json({ success: true, data: user });
    } catch (error) {
      logger.error("Error fetching last mana by ID: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch last mana",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
