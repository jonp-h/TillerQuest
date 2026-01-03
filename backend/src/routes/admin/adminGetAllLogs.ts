import { Response } from "express";
import { logger } from "../../lib/logger.js";
import { requireAdmin, requireAuth } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";
import { db } from "lib/db.js";

export const adminGetAllLogs = [
  requireAuth,
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const logs = await db.log.findMany({
        orderBy: {
          createdAt: "desc",
        },
        where: {
          global: true,
          message: {
            not: {
              startsWith: "COSMIC",
            },
          },
        },
      });

      res.json({
        success: true,
        data: logs,
      });
    } catch (error) {
      logger.error("Failed to get all logs: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to get all logs.",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
