import { db } from "lib/db.js";
import { ErrorMessage } from "lib/error.js";
import { logger } from "lib/logger.js";
import { join } from "path";
import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";
import { createHash, randomBytes } from "crypto";
import { existsSync } from "fs";
import { writeFile, mkdir } from "fs/promises";
import { addLog } from "utils/logs/addLog.js";

// Security constants - OWASP recommendations
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp"] as const;
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
const MIN_FILE_SIZE = 1024; // 1KB
const MAX_DIMENSIONS = { width: 4096, height: 4096 };
const MIN_DIMENSIONS = { width: 100, height: 100 };

// OWASP: Store uploads in a quarantine directory for admin review
const QUARANTINE_DIR = join(process.cwd(), "uploads", "quarantine");

export const uploadImage = async (
  userId: string,
  buffer: Buffer,
  originalFilename: string,
) => {
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

  const guildName = user?.guild?.name;
  if (!guildName) {
    throw new ErrorMessage("You are not a member of any guild.");
  }

  if (!user?.guild || user.guild.guildLeader !== userId) {
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

  // OWASP: Validate file size (prevent DoS attacks)
  if (buffer.length > MAX_FILE_SIZE) {
    logger.warn(
      `File size exceeded (${buffer.length} bytes) by user ${userId}`,
    );
    throw new ErrorMessage(
      `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB.`,
    );
  }

  if (buffer.length < MIN_FILE_SIZE) {
    logger.warn(`File too small (${buffer.length} bytes) by user ${userId}`);
    throw new ErrorMessage("File is too small or empty.");
  }

  // OWASP: Validate file extension (never trust user input)
  const originalFilenameLower = originalFilename.toLowerCase();
  const fileExtension = originalFilenameLower.split(".").pop();

  if (
    !fileExtension ||
    !ALLOWED_EXTENSIONS.includes(
      fileExtension as (typeof ALLOWED_EXTENSIONS)[number],
    )
  ) {
    logger.warn(`Invalid file extension (.${fileExtension}) by user ${userId}`);
    throw new ErrorMessage(
      "Invalid file extension. Only .jpg, .jpeg, .png, .gif and .webp are allowed.",
    );
  }

  // OWASP: Validate true file type using magic numbers (prevent MIME spoofing)
  const detectedFileType = await fileTypeFromBuffer(buffer);

  if (
    !detectedFileType ||
    !ALLOWED_MIME_TYPES.includes(
      detectedFileType.mime as (typeof ALLOWED_MIME_TYPES)[number],
    )
  ) {
    logger.warn(
      `File content type mismatch. Detected: ${detectedFileType?.mime || "unknown"}. Uploaded by user ${userId}`,
    );
    throw new ErrorMessage(
      "File content does not match a valid image format. Possible file corruption or security threat detected.",
    );
  }

  // OWASP: Validate image dimensions & sanitize (prevent decompression bombs)
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

  const randomFilename = randomBytes(32).toString("hex");
  const secureFilename = `${randomFilename}.${detectedFileType.ext}`;

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
};
