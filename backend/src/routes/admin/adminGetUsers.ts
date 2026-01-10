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
          break;
        case "full":
        default:
          // Return all fields (full user objects)
          select = undefined;
          break;
      }

      const whereClause =
        fields === "basic" || fields === "admin"
          ? undefined
          : fields === "dead"
            ? {
                hp: 0,
              }
            : {
                role: {
                  //TODO: INACTIVE required?
                  notIn: ["NEW", "ARCHIVED"],
                },
              };

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
