import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAuth, requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import {
  validateBody,
  validateParams,
} from "../../middleware/validationMiddleware.js";
import { UserRole } from "@tillerquest/prisma/browser";
import {
  updateUserRoleSchema,
  userIdParamSchema,
} from "utils/validators/validationUtils.js";

interface UpdateUserRoleRequest extends AuthenticatedRequest {
  body: {
    role: UserRole;
  };
  params: {
    userId: string;
  };
}

export const adminUpdateUserRole = [
  requireAuth,
  requireAdmin,
  validateParams(userIdParamSchema),
  validateBody(updateUserRoleSchema),
  async (req: UpdateUserRoleRequest, res: Response) => {
    try {
      const userId = req.params.userId;
      const { role } = req.body;

      await db.user.update({
        where: {
          id: userId,
        },
        data: {
          role: role as UserRole,
        },
      });

      res.json({
        success: true,
        data: {
          message: "User role updated successfully.",
        },
      });
    } catch (error) {
      logger.error("Error updating user role: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to update user role",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
