import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import { validateQuery } from "../../middleware/validationMiddleware.js";
import z from "zod";
import { SchoolClass } from "@tillerquest/prisma/browser";

export const adminGetUsers = [
  requireAdmin,
  validateQuery(
    z.object({
      fields: z.enum(["basic", "admin", "full", "dead"]).optional(),
      schoolClass: z.enum(SchoolClass).optional(),
    }),
  ),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const fields = req.query.fields as string | undefined;

      let select;
      let whereClause: object | undefined;

      switch (fields) {
        case "basic":
          select = {
            id: true,
            name: true,
            lastname: true,
            schoolClass: true,
          };
          whereClause = {
            schoolClass: req.query.schoolClass as SchoolClass | undefined,
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
          whereClause = {
            schoolClass: req.query.schoolClass as SchoolClass | undefined,
          };
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
            schoolClass: req.query.schoolClass as SchoolClass | undefined,
            hp: 0,
          };
          break;
        case "full":
          select = {
            id: true,
            name: true,
            username: true,
            lastname: true,
            hp: true,
            hpMax: true,
            mana: true,
            manaMax: true,
            image: true,
            titleRarity: true,
            title: true,
            guild: {
              select: {
                guildLeader: true,
                nextGuildLeader: true,
              },
            },
          };
          whereClause = {
            role: {
              notIn: ["NEW", "ARCHIVED", "ADMIN"], // only get active users. (inactive, users)
            },
            schoolClass: req.query.schoolClass as SchoolClass | undefined,
          };
          break;
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
              notIn: ["NEW", "ARCHIVED"], // only get active users. (inactive, admins, users)
            },
            schoolClass: req.query.schoolClass as SchoolClass | undefined,
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
