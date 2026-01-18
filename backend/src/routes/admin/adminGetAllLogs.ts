import { Response } from "express";
import { logger } from "../../lib/logger.js";
import { requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";
import { db } from "lib/db.js";

export const adminGetAllLogs = [
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const limit = req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : 100;
      const offset = req.query.offset
        ? parseInt(req.query.offset as string, 10)
        : 0;

      const logs = await db.log.findMany({
        orderBy: {
          createdAt: "desc",
        },
        skip: offset,
        take: limit,
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
