import { Response } from "express";
import { logger } from "../../lib/logger.js";
import { requireActiveUser } from "../../middleware/authMiddleware.js";
import { ErrorMessage } from "lib/error.js";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";
import { uploadImage } from "utils/guilds/imageUpload.js";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(), // Store in memory for processing
  limits: {
    fileSize: 4 * 1024 * 1024, // 4MB max
    files: 1, // Only one file
  },
  fileFilter: (req, file, cb) => {
    // Pre-filter by MIME type (first line of defense)
    const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (JPEG, PNG, GIF, WebP) are allowed"));
    }
  },
});

interface UploadGuildImageRequest extends AuthenticatedRequest {
  file?: Express.Multer.File;
}

export const uploadGuildImage = [
  requireActiveUser,
  upload.single("image"),
  async (req: UploadGuildImageRequest, res: Response) => {
    try {
      const userId = req.session!.user.id;

      if (!req.file) {
        throw new ErrorMessage("No image file provided.");
      }

      const { buffer, originalname } = req.file;

      await uploadImage(userId, buffer, originalname);

      res.json({
        success: true,
        data: "Successfully uploaded guild image. Awaiting verification from a game master.",
      });
    } catch (error) {
      if (error instanceof ErrorMessage) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
        return;
      }

      // Handle multer errors
      if (error instanceof multer.MulterError) {
        logger.warn(`Multer error during guild image upload: ${error.message}`);
        if (error.code === "LIMIT_FILE_SIZE") {
          res.status(400).json({
            success: false,
            error: "File size exceeds maximum allowed size of 4MB.",
          });
          return;
        }
        res.status(400).json({
          success: false,
          error: `File upload error: ${error.message}`,
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
