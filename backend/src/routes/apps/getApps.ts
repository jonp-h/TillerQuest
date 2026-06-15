import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireActiveUser } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import { ErrorMessage } from "../../lib/error.js";

export const getApps = [
  requireActiveUser,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const app = await db.app.findMany();

      if (!app) {
        logger.info("No apps found");
        throw new ErrorMessage("Apps not found");
      }

      res.json({
        success: true,
        data: app,
      });
    } catch (error) {
      if (error instanceof ErrorMessage) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
        return;
      }
      logger.error("Error getting apps: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to get apps",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
