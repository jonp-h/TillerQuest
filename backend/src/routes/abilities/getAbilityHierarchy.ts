import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import {
  requireAuth,
  requireActiveUser,
} from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";

export const getAbilityHierarchy = [
  requireAuth,
  requireActiveUser,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // gets all abilities that have no parents, and their children
      const roots = await db.ability.findMany({
        where: {
          parent: null,
          category: {
            not: "Cosmic", // exclude cosmic abilities
          },
        },
        select: {
          name: true,
          icon: true,
          category: true,
          children: {
            select: {
              name: true,
              icon: true,
              children: {
                select: {
                  name: true,
                  icon: true,
                  children: {
                    select: {
                      name: true,
                      icon: true,
                      children: {
                        select: {
                          name: true,
                          icon: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          category: "asc",
        },
      });

      res.json({
        success: true,
        data: roots,
      });
    } catch (error) {
      logger.error("Failed to get ability hierarchy: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to retrieve ability hierarchy",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
