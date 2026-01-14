import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAuth, requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import { validateQuery } from "middleware/validationMiddleware.js";
import z from "zod";

export const adminGetUsers = [
  requireAuth,
  requireAdmin,
  validateQuery(
    z.object({
      fields: z.enum(["basic", "admin", "full", "dead"]).optional(),
    }),
  ),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const fields = req.query.fields as string | undefined;

      let select: any;
      let whereClause: any;

      switch (fields) {
        case "basic":
          select = {
            id: true,
            name: true,
            lastname: true,
            schoolClass: true,
          };
          break;
        case "admin":
          select = {
            id: true,
            name: true,
            lastname: true,
            username: true,
            special: true,
            role: true,
            schoolClass: true,
            access: true,
          };
          whereClause = undefined;
          break;
        case "dead":
          select = {
            id: true,
            username: true,
            name: true,
            lastname: true,
            image: true,
            level: true,
          };
          whereClause = {
            hp: 0,
          };
          break;
        case "full":
        default:
          // Return all fields (full user objects)
          select = {
            id: true,
            name: true,
            username: true,
            lastname: true,
            hp: true,
            mana: true,
            xp: true,
            role: true,
            gold: true,
            level: true,
            class: true,
            guildName: true,
            schoolClass: true,
          };
          whereClause = {
            role: {
              notIn: ["NEW", "ARCHIVED"],
            },
          };
          break;
      }

      const users = await db.user.findMany({
        where: whereClause,
        select: select,
        orderBy: [
          {
            schoolClass: "asc",
          },
          {
            name: "asc",
          },
          {
            lastname: "asc",
          },
        ],
      });

      res.json({ success: true, data: users });
    } catch (error) {
      logger.error("Error fetching users: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch users",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
