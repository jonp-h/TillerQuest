"use server";

import { AuthorizationError, validateAdminAuth } from "@/lib/authUtils";
import { db } from "@/lib/db";
import { ErrorMessage } from "@/lib/error";
import { logger } from "@/lib/logger";
import { existsSync } from "fs";
import { mkdir, rename, readFile, unlink } from "fs/promises";
import { join } from "path";
import { createHash } from "crypto";
import { addLog } from "../log/addLog";
import { ServerActionResult } from "@/types/serverActionResult";

const QUARANTINE_DIR = join(process.cwd(), "uploads", "quarantine");
const APPROVED_DIR = join(process.cwd(), "public", "guilds");

export const getPendingImageUploadsCount = async () => {
  try {
    await validateAdminAuth();

    const count = await db.imageUpload.count({
      where: {
        status: "PENDING",
      },
    });

    return count;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized admin access attempt to reject image");
      return 0;
    }

    logger.error(`Error rejecting image upload: ${error}`);
    return 0;
  }
};

export const adminGetPendingImageUploads = async () => {
  try {
    await validateAdminAuth();

    const pendingUploads = await db.imageUpload.findMany({
      where: {
        status: "PENDING",
      },
      include: {
        uploader: {
          select: {
            id: true,
            username: true,
            name: true,
            lastname: true,
          },
        },
        guild: {
          select: {
            name: true,
            id: true,
          },
        },
      },
      orderBy: {
        uploadedAt: "desc",
      },
    });
    // OWASP: Load images server-side and convert to base64
    // This prevents exposing quarantine directory via API
    const uploadsWithPreviews = await Promise.all(
      pendingUploads.map(async (upload) => {
        try {
          const filePath = join(QUARANTINE_DIR, upload.filename);

          // Verify file exists
          if (!existsSync(filePath)) {
            logger.warn(
              `Quarantined file not found: ${upload.filename} for upload ID: ${upload.id}`,
            );
            return {
              ...upload,
              previewUrl: null,
              previewError: "File not found in quarantine",
            };
          }

          // Read file and convert to base64
          const fileBuffer = await readFile(filePath);

          // OWASP: Verify file integrity using stored hash
          if (upload.fileHash) {
            const currentHash = createHash("sha256")
              .update(fileBuffer)
              .digest("hex");

            if (currentHash !== upload.fileHash) {
              logger.error(
                `File integrity check failed for upload ${upload.id}. Expected: ${upload.fileHash}, Got: ${currentHash}`,
              );
              return {
                ...upload,
                previewUrl: null,
                previewError:
                  "File integrity check failed - file may have been tampered with",
              };
            }
          }

          // Determine MIME type from extension
          const extension = upload.filename.split(".").pop()?.toLowerCase();
          const mimeTypeMap: Record<string, string> = {
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            png: "image/png",
            webp: "image/webp",
            gif: "image/gif",
          };

          const mimeType = extension ? mimeTypeMap[extension] : "image/jpeg";

          // Create data URL
          const base64 = fileBuffer.toString("base64");
          const previewUrl = `data:${mimeType};base64,${base64}`;

          return {
            ...upload,
            previewUrl,
            previewError: null,
          };
        } catch (error) {
          logger.error(
            `Error loading preview for upload ${upload.id}: ${error}`,
          );
          return {
            ...upload,
            previewUrl: null,
            previewError: "Failed to load image",
          };
        }
      }),
    );

    return uploadsWithPreviews;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn(
        "Unauthorized admin access attempt to get pending image uploads",
      );
      throw error;
    }

    logger.error("Error fetching pending image uploads", error);
    throw new Error(
      "Failed to fetch pending image uploads. Error timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

export const approveImageUpload = async (
  uploadId: string,
): Promise<ServerActionResult> => {
  try {
    const session = await validateAdminAuth();

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

    // OWASP: Verify file integrity before approval
    if (upload.fileHash) {
      const fileBuffer = await readFile(quarantinePath);
      const currentHash = createHash("sha256").update(fileBuffer).digest("hex");

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
        `Moved image from quarantine to approved: ${upload.filename} by admin ${session.user.id}`,
      );
    } catch (error) {
      logger.error(`Failed to move approved image: ${error}`);
      throw new ErrorMessage("Failed to approve image. Please try again.");
    }

    // OWASP: Use transaction for related database operations
    return await db.$transaction(async (db) => {
      // Update database record
      await db.imageUpload.update({
        where: { id: uploadId },
        data: {
          status: "APPROVED",
          reviewedBy: session.user.id,
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
          `Congratulations. Your new guild logo has been approved by GM ${session.user.username}.`,
          false,
        );
      }

      logger.info(
        `Admin ${session.user.id} approved image upload ${uploadId} for guild ${upload.guildName}. Filename: ${upload.filename}`,
      );

      return {
        success: true,
        data: `Successfully approved image for ${upload.guildName}.`,
      };
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized admin access attempt to approve image");
      return {
        success: false,
        error: error.message,
      };
    }

    if (error instanceof ErrorMessage) {
      return {
        success: false,
        error: error.message,
      };
    }

    logger.error(`Error approving image upload: ${error}`);
    return {
      success: false,
      error:
        "Failed to approve image. Error timestamp: " + new Date().toISOString(),
    };
  }
};

export const rejectImageUpload = async (
  uploadId: string,
  reason = "No reason provided",
): Promise<ServerActionResult> => {
  try {
    const session = await validateAdminAuth();

    const upload = await db.imageUpload.findUnique({
      where: { id: uploadId },
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

    // Verify file exists in quarantine
    if (!existsSync(quarantinePath)) {
      logger.error(
        `Quarantined file not found: ${quarantinePath} for upload ID: ${uploadId}`,
      );
      throw new ErrorMessage(
        "Image file not found in quarantine. It may have been deleted.",
      );
    }

    // Delete the file from quarantine
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
    return await db.$transaction(async (db) => {
      // Update database record
      await db.imageUpload.update({
        where: { id: uploadId },
        data: {
          status: "REJECTED",
          reviewedBy: session.user.id,
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
          `Bad News: Your new guild logo has been rejected by GM ${session.user.username}. Reason: ${reason}`,
          false,
        );
      }

      logger.info(
        `Admin ${session.user.id} rejected image upload ${uploadId} for guild ${upload.guildName}. Filename: ${upload.filename}`,
      );

      return {
        success: true,
        data: `Successfully rejected image for ${upload.guildName}.`,
      };
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized admin access attempt to reject image");
      return {
        success: false,
        error: error.message,
      };
    }

    if (error instanceof ErrorMessage) {
      return {
        success: false,
        error: error.message,
      };
    }

    logger.error(`Error rejecting image upload: ${error}`);
    return {
      success: false,
      error:
        "Failed to reject image. Error timestamp: " + new Date().toISOString(),
    };
  }
};
