import { Response } from "express";
import { logger } from "../../lib/logger.js";
import { requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";
import { db } from "lib/db.js";
import { join } from "path";
import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { createHash } from "crypto";

const QUARANTINE_DIR = join(process.cwd(), "uploads", "quarantine");

export const adminGetPendingImages = [
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
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

      res.json({ success: true, data: uploadsWithPreviews });
    } catch (error) {
      logger.error("Error loading pending images: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to load pending images",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
