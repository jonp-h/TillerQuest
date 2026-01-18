import { Response } from "express";
import { logger } from "../../lib/logger.js";
import { requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import {
  validateBody,
  validateParams,
} from "middleware/validationMiddleware.js";
import { join } from "path";
import { db } from "lib/db.js";
import z from "zod";
import { ErrorMessage } from "lib/error.js";
import { existsSync } from "fs";
import { mkdir, readFile, rename, unlink } from "fs/promises";
import { createHash } from "crypto";
import { addLog } from "utils/logs/addLog.js";

const QUARANTINE_DIR = join(process.cwd(), "uploads", "quarantine");
const APPROVED_DIR = join(process.cwd(), "static", "guilds");

const imageReviewParamsSchema = z.object({
  uploadId: z.cuid(),
});
const imageReviewBodySchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  reason: z.string().optional(),
});

interface ImageReviewRequest extends AuthenticatedRequest {
  params: {
    uploadId: string;
  };
  body: {
    action: "APPROVE" | "REJECT";
    reason?: string;
  };
}

export const adminReviewImage = [
  requireAdmin,
  validateParams(imageReviewParamsSchema),
  validateBody(imageReviewBodySchema),
  async (req: ImageReviewRequest, res: Response) => {
    try {
      const userId = req.session!.user.id;
      const { uploadId } = req.params;
      const { action, reason } = req.body;

      const upload = await db.imageUpload.findUnique({
        where: { id: uploadId },
        include: {
          guild: {
            select: {
              name: true,
              icon: true,
            },
          },
        },
      });

      if (!upload) {
        throw new ErrorMessage("Upload not found.");
      }

      if (upload.status !== "PENDING") {
        throw new ErrorMessage(
          `Upload has already been ${upload.status.toLowerCase()}.`,
        );
      }

      const quarantinePath = join(QUARANTINE_DIR, upload.filename);
      const approvedPath = join(APPROVED_DIR, upload.filename);

      // Verify file exists in quarantine
      if (!existsSync(quarantinePath)) {
        logger.error(
          `Quarantined file not found: ${quarantinePath} for upload ID: ${uploadId}`,
        );
        throw new ErrorMessage(
          "Image file not found in quarantine. It may have been deleted.",
        );
      }

      // --------- Handle REJECT action ---------
      // Delete the file from quarantine
      if (action === "REJECT") {
        try {
          if (existsSync(quarantinePath)) {
            await unlink(quarantinePath);
            logger.info(
              `Deleted rejected image from quarantine: ${upload.filename}`,
            );
          }
        } catch (error) {
          logger.error(`Failed to delete rejected image: ${error}`);
          throw new ErrorMessage("Failed to reject image. Please try again.");
        }

        // OWASP: Use transaction for related database operations
        await db.$transaction(async (db) => {
          // Update database record
          await db.imageUpload.update({
            where: { id: uploadId },
            data: {
              status: "REJECTED",
              reviewedBy: userId,
              reviewedAt: new Date(),
              reason: reason,
            },
          });

          // Log the action for the guild members
          const guildMembers = await db.user.findMany({
            where: {
              guildName: upload.guildName,
            },
            select: { id: true },
          });
          for (const member of guildMembers) {
            await addLog(
              db,
              member.id,
              `Bad News: Your new guild logo has been rejected by GM ${req.session?.user.username}. Reason: ${reason}`,
              false,
            );
          }

          logger.info(
            `Admin ${userId} rejected image upload ${uploadId} for guild ${upload.guildName}. Filename: ${upload.filename}`,
          );

          res.json({
            success: true,
            data: `Successfully rejected image for ${upload.guildName}`,
          });
          return;
        });
      } else {
        // --------------- Handle APPROVE action ---------------

        // OWASP: Verify file integrity before approval
        if (upload.fileHash) {
          const fileBuffer = await readFile(quarantinePath);
          const currentHash = createHash("sha256")
            .update(fileBuffer)
            .digest("hex");

          if (currentHash !== upload.fileHash) {
            logger.error(
              `File integrity check failed during approval for upload ${uploadId}. Expected: ${upload.fileHash}, Got: ${currentHash}`,
            );
            throw new ErrorMessage(
              "File integrity check failed. The file may have been tampered with and cannot be approved.",
            );
          }
        }

        // Move file from quarantine to approved directory
        try {
          // Ensure approved directory exists
          if (!existsSync(APPROVED_DIR)) {
            await mkdir(APPROVED_DIR, { recursive: true });
          }

          await rename(quarantinePath, approvedPath);
          logger.info(
            `Moved image from quarantine to approved: ${upload.filename} by admin ${userId}`,
          );
        } catch (error) {
          logger.error(`Failed to move approved image: ${error}`);
          throw new ErrorMessage("Failed to approve image. Please try again.");
        }

        // OWASP: Use transaction for related database operations
        await db.$transaction(async (db) => {
          // Update database record
          await db.imageUpload.update({
            where: { id: uploadId },
            data: {
              status: "APPROVED",
              reviewedBy: userId,
              reviewedAt: new Date(),
            },
          });

          // Update guild icon to use the new image
          if (upload.guildName) {
            await db.guild.update({
              where: { name: upload.guildName },
              data: {
                icon: `${upload.filename}`,
              },
            });
          }

          // Log the action for the guildmembers
          const guildMembers = await db.user.findMany({
            where: {
              guildName: upload.guildName,
            },
            select: { id: true },
          });
          for (const member of guildMembers) {
            await addLog(
              db,
              member.id,
              `Congratulations. Your new guild logo has been approved by GM ${req.session?.user.username}.`,
              false,
            );
          }

          logger.info(
            `Admin ${userId} approved image upload ${uploadId} for guild ${upload.guildName}. Filename: ${upload.filename}`,
          );

          res.json({
            success: true,
            data: `Successfully approved image for ${upload.guildName}`,
          });
        });
      }
    } catch (error) {
      if (error instanceof ErrorMessage) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
        return;
      }

      logger.error("Error reviewing image: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to review image",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
