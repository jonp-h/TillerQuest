import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAuth, requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import {
  validateBody,
  validateParams,
} from "../../middleware/validationMiddleware.js";
import { Access } from "@tillerquest/prisma/browser";
import {
  adminUpdateUserSchema,
  userIdParamSchema,
} from "utils/validators/validationUtils.js";
import { ErrorMessage } from "lib/error.js";

interface AdminUpdateUserRequest extends AuthenticatedRequest {
  body: {
    special?: string[];
    access?: string[];
    name?: string;
    username?: string;
    lastname?: string;
  };
  params: {
    userId: string;
  };
}

// TODO: add more validation
export const adminUpdateUser = [
  requireAuth,
  requireAdmin,
  validateParams(userIdParamSchema),
  validateBody(adminUpdateUserSchema),
  async (req: AdminUpdateUserRequest, res: Response) => {
    try {
      const userId = req.params.userId;
      const { special, access, name, username, lastname } = req.body;

      // Check if username already exists
      if (username) {
        const existingUser = await db.user.findFirst({
          where: {
            username,
          },
        });

        if (existingUser && existingUser.id !== userId) {
          throw new ErrorMessage("Username already taken by another user.");
        }
      }

      // If access is provided and contains an empty string, treat as removing all access
      let processedAccess = access;
      if (access && access.length === 1 && access[0] === "") {
        processedAccess = [];
      }

      await db.user.update({
        where: {
          id: userId,
        },
        data: {
          name,
          username,
          lastname,
          special,
          access: processedAccess as Access[] | undefined,
        },
      });

      res.json({
        success: true,
        data: "User information updated successfully.",
      });
    } catch (error) {
      if (error instanceof ErrorMessage) {
        res.status(400).json({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      logger.error("Error updating user: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to update user",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
