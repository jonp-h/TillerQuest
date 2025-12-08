"use server";

import {
  AuthorizationError,
  validateUserIdAndActiveUserAuth,
} from "@/lib/authUtils";
import { db } from "@/lib/db";
import { ErrorMessage } from "@/lib/error";
import { logger } from "@/lib/logger";
import { ServerActionResult } from "@/types/serverActionResult";
import sharp from "sharp";
import { fileTypeFromBuffer } from "file-type";
import { randomBytes, createHash } from "crypto";
import { existsSync } from "fs";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { addLog } from "../log/addLog";

// Security constants - OWASP recommendations
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp"] as const;
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB - OWASP: Limit upload size
const MIN_FILE_SIZE = 1024; // 1KB - Prevent empty/corrupt files
const MAX_DIMENSIONS = { width: 4096, height: 4096 }; // Prevent decompression bombs
const MIN_DIMENSIONS = { width: 100, height: 100 }; // Ensure usable images

// OWASP: Store uploads outside public directory for security
const QUARANTINE_DIR = join(process.cwd(), "uploads", "quarantine");

export const uploadGuildImage = async (
  userId: string,
  guildName: string,
  formData: FormData,
): Promise<ServerActionResult> => {
  try {
    await validateUserIdAndActiveUserAuth(userId);

    // Verify user is guild leader
    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        username: true,
        guild: {
          select: {
            name: true,
            guildLeader: true,
          },
        },
      },
    });

    if (
      !user?.guild ||
      user.guild.name !== guildName ||
      user.guild.guildLeader !== userId
    ) {
      throw new ErrorMessage("Only the guild leader can upload guild images.");
    }

    const pendingUpload = await db.imageUpload.findFirst({
      where: {
        guildName: guildName,
        status: "PENDING",
      },
    });

    if (pendingUpload) {
      throw new ErrorMessage(
        "There is already a pending guild image upload for this guild. Please wait for it to be reviewed before uploading a new one.",
      );
    }

    const recentUpload = await db.imageUpload.findFirst({
      where: {
        guildName: guildName,
      },
      orderBy: {
        uploadedAt: "desc",
      },
    });

    const cooldownHours = await db.applicationSettings.findFirst({
      where: {
        key: "GUILD_IMAGE_UPLOAD_COOLDOWN_HOURS",
      },
    });

    if (recentUpload && cooldownHours) {
      const hoursSinceLastUpload =
        (Date.now() - recentUpload.uploadedAt.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastUpload < parseInt(cooldownHours.value, 10)) {
        throw new ErrorMessage(
          `You can only upload a new guild image every ${cooldownHours.value} hours. Please wait before uploading a new image.`,
        );
      }
    } else if (!cooldownHours) {
      logger.error(
        "Could not determine last upload time or cooldown settings for guild image upload.",
      );
      throw new ErrorMessage(
        "Could not verify upload cooldown. Please try again later.",
      );
    }

    // Validate uploaded file
    const file = formData.get("image");

    // OWASP: Validate file exists and is File type
    if (!file || !(file instanceof File)) {
      logger.warn(`Invalid file upload attempt by user ${userId}`);
      throw new ErrorMessage("No valid image file provided.");
    }

    // 2. OWASP: Validate file size (prevent DoS attacks)
    if (file.size > MAX_FILE_SIZE) {
      logger.warn(`File size exceeded (${file.size} bytes) by user ${userId}`);
      throw new ErrorMessage(
        `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB.`,
      );
    }

    if (file.size < MIN_FILE_SIZE) {
      logger.warn(`File too small (${file.size} bytes) by user ${userId}`);
      throw new ErrorMessage("File is too small or empty.");
    }

    // 3. OWASP: Validate file extension (never trust user input)
    const originalFilename = file.name.toLowerCase();
    const fileExtension = originalFilename.split(".").pop();

    if (
      !fileExtension ||
      !ALLOWED_EXTENSIONS.includes(
        fileExtension as (typeof ALLOWED_EXTENSIONS)[number],
      )
    ) {
      logger.warn(
        `Invalid file extension (.${fileExtension}) by user ${userId}`,
      );
      throw new ErrorMessage(
        "Invalid file extension. Only .jpg, .jpeg, .png, .gif and .webp are allowed.",
      );
    }

    // 4. OWASP: Convert File to Buffer for deep inspection
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 5. OWASP: Validate true file type using magic numbers (prevent MIME spoofing)
    const detectedFileType = await fileTypeFromBuffer(buffer);

    if (
      !detectedFileType ||
      !ALLOWED_MIME_TYPES.includes(
        detectedFileType.mime as (typeof ALLOWED_MIME_TYPES)[number],
      )
    ) {
      logger.warn(
        `File content type mismatch. Claimed: ${file.type}, Detected: ${detectedFileType?.mime || "unknown"} by user ${userId}`,
      );
      throw new ErrorMessage(
        "File content does not match a valid image format. Possible file corruption or security threat detected.",
      );
    }

    // 6. OWASP: Validate image dimensions & sanitize (prevent decompression bombs)
    let imageMetadata;
    try {
      imageMetadata = await sharp(buffer).metadata();
    } catch (error) {
      logger.error(
        `Sharp metadata extraction failed for user ${userId}: ${error}`,
      );
      throw new ErrorMessage(
        "Unable to process image. The file may be corrupted or in an unsupported format.",
      );
    }

    if (!imageMetadata.width || !imageMetadata.height) {
      throw new ErrorMessage("Unable to determine image dimensions.");
    }

    // OWASP: Prevent decompression bomb attacks
    if (
      imageMetadata.width > MAX_DIMENSIONS.width ||
      imageMetadata.height > MAX_DIMENSIONS.height
    ) {
      logger.warn(
        `Image dimensions too large (${imageMetadata.width}x${imageMetadata.height}) by user ${userId}`,
      );
      throw new ErrorMessage(
        `Image dimensions exceed maximum allowed size of ${MAX_DIMENSIONS.width}x${MAX_DIMENSIONS.height}px.`,
      );
    }

    if (
      imageMetadata.width < MIN_DIMENSIONS.width ||
      imageMetadata.height < MIN_DIMENSIONS.height
    ) {
      throw new ErrorMessage(
        `Image dimensions too small. Minimum required: ${MIN_DIMENSIONS.width}x${MIN_DIMENSIONS.height}px.`,
      );
    }

    const randomSuffix = randomBytes(16).toString("hex");
    const secureFilename = `guild_${user.guild.name.toLowerCase()}_${Date.now()}_${randomSuffix}.${detectedFileType.ext}`;

    // 8. OWASP: Re-encode image to strip metadata and potential exploits
    let sanitizedBuffer;
    try {
      if (detectedFileType.ext === "gif") {
        // For GIFs, preserve animation
        sanitizedBuffer = await sharp(buffer, { animated: true }) //
          .resize(MAX_DIMENSIONS.width, MAX_DIMENSIONS.height, {
            fit: "inside",
            withoutEnlargement: true,
          })
          .gif()
          .toBuffer();
      } else {
        // For static images (JPEG, PNG, WebP)
        sanitizedBuffer = await sharp(buffer)
          .resize(MAX_DIMENSIONS.width, MAX_DIMENSIONS.height, {
            fit: "inside",
            withoutEnlargement: true,
          })
          .toFormat(detectedFileType.ext as "jpeg" | "png" | "webp", {
            quality: 90,
          })
          .toBuffer();
      }
    } catch (error) {
      logger.error(`Image sanitization failed for user ${userId}: ${error}`);
      throw new ErrorMessage(
        "Failed to process image. Please try a different file.",
      );
    }

    // 9. OWASP: Calculate file hash for integrity verification
    const fileHash = createHash("sha256").update(sanitizedBuffer).digest("hex");

    // OWASP: Store sanitized image securely in quarantine folder
    try {
      // Ensure quarantine directory exists
      if (!existsSync(QUARANTINE_DIR)) {
        await mkdir(QUARANTINE_DIR, { recursive: true });
        logger.info(`Created quarantine directory: ${QUARANTINE_DIR}`);
      }

      const quarantinePath = join(QUARANTINE_DIR, secureFilename);
      await writeFile(quarantinePath, sanitizedBuffer);

      logger.info(
        `Saved image to quarantine: ${quarantinePath} (${sanitizedBuffer.length} bytes)`,
      );
    } catch (error) {
      logger.error(`Failed to write file to quarantine: ${error}`);
      throw new ErrorMessage("Failed to save image. Please try again later.");
    }

    // 10. Create database record for admin review (OWASP: Defense in depth)
    await db.imageUpload.create({
      data: {
        uploadedBy: userId,
        guildName: guildName,
        filename: secureFilename,
        fileHash: fileHash,
        status: "PENDING",
        uploadedAt: new Date(),
      },
    });

    // OWASP: Log security-relevant events
    logger.info(
      `Guild image upload initiated by user ${user.username} (${userId} )for guild ${guildName}. Filename: ${secureFilename}`,
    );

    await addLog(
      db,
      userId,
      `${user.username} uploaded a new guild image for guild ${guildName}, pending review.`,
      false,
    );

    return {
      success: true,
      data: "Successfully uploaded guild image. Awaiting verification from a game master",
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn(
        "Unauthorized access attempt to upload guild image: " + error.message,
      );
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

    logger.error("Error uploading guild image: " + error);
    return {
      success: false,
      error:
        "Something went wrong while uploading the guild image. Error timestamp: " +
        Date.now().toLocaleString("no-NO"),
    };
  }
};
