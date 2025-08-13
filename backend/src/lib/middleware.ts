import rateLimit from "express-rate-limit";
import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import { logger } from "./logger.js";

// In-memory nonce store for replay attack prevention
const usedNonces = new Map<string, number>();
const NONCE_CLEANUP_INTERVAL = 10 * 60 * 1000; // 10 minutes
const NONCE_EXPIRY = 10 * 60 * 1000; // 10 minutes

// Cleanup expired nonces periodically
setInterval(() => {
  const now = Date.now();
  for (const [nonce, timestamp] of usedNonces.entries()) {
    if (now - timestamp > NONCE_EXPIRY) {
      usedNonces.delete(nonce);
    }
  }
  logger.info(`Nonce cleanup completed. Active nonces: ${usedNonces.size}`);
}, NONCE_CLEANUP_INTERVAL);

// Validate nonce to prevent replay attacks
export const validateNonce = (nonce: string): boolean => {
  const now = Date.now();

  // Check if nonce was already used
  if (usedNonces.has(nonce)) {
    logger.warn(`Replay attack detected: nonce ${nonce} already used`);
    return false;
  }

  // Validate nonce format (should be at least 16 characters hex)
  if (!/^[a-f0-9]{16,}$/i.test(nonce)) {
    logger.warn(`Invalid nonce format: ${nonce}`);
    return false;
  }

  // Store nonce with timestamp
  usedNonces.set(nonce, now);
  return true;
};

// Extend Express Request type for custom properties
declare module "express-serve-static-core" {
  interface Request {
    authenticatedApiKey?: string;
    requestTimestamp?: number;
    requestNonce?: string;
  }
}

// Enhanced rate limiting with multiple tiers
export const createRateLimiter = (
  windowMs: number,
  max: number,
  skipSuccessfulRequests = false,
) => {
  return rateLimit({
    windowMs,
    max,
    skipSuccessfulRequests,
    message: {
      error: "Too many requests from this IP",
      retryAfter: Math.ceil(windowMs / 1000),
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// IP-based rate limiting
export const ipRateLimit = createRateLimiter(15 * 60 * 1000, 100); // 100 requests per 15 minutes per IP

// API key-based rate limiting (more restrictive)
export const apiKeyRateLimit = createRateLimiter(60 * 1000, 10, true); // 10 requests per minute per API key

// Request signature validation
export const validateRequestSignature = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const apiKey = req.headers["x-api-key"] as string;
  const signature = req.headers["x-signature"] as string;
  const timestamp = req.headers["x-timestamp"] as string;
  const nonce = req.headers["x-nonce"] as string;

  if (!apiKey || !signature || !timestamp || !nonce) {
    logger.warn(
      `Invalid request received: API Key: ${apiKey}, Timestamp: ${timestamp}, Nonce: ${nonce}`,
    );
    res.status(401).json({
      error: "Missing required authentication headers",
      required: ["x-api-key", "x-signature", "x-timestamp", "x-nonce"],
    });
    return;
  }

  // Validate timestamp (prevent replay attacks)
  const requestTime = parseInt(timestamp);
  const currentTime = Date.now();
  const timeDiff = Math.abs(currentTime - requestTime);

  if (timeDiff > 5 * 60 * 1000) {
    logger.warn(
      `Invalid timestamp request received: API Key: ${apiKey}, Timestamp: ${timestamp}, Nonce: ${nonce}`,
    );
    // 5 minutes tolerance
    res.status(401).json({ error: "Request timestamp too old or invalid" });
    return;
  }

  const validApiKey = process.env.API_KEY;
  const apiSecret = process.env.API_SECRET;

  if (!validApiKey || apiKey !== validApiKey) {
    logger.warn(
      `Invalid api key request received: API Key: ${apiKey}, Timestamp: ${timestamp}, Nonce: ${nonce}`,
    );
    res.status(401).json({ error: "Invalid API key" });
    return;
  }

  if (!apiSecret) {
    logger.warn(
      `Invalid api key secret received: API Key: ${apiKey}, Timestamp: ${timestamp}, Nonce: ${nonce}`,
    );
    res
      .status(500)
      .json({ error: "API secret is not configured on the server" });
    return;
  }

  // Create signature for validation
  const method = req.method;
  const path = req.path;
  const stringToSign = `${method}|/api${path}|${timestamp}|${nonce}`;

  const expectedSignature = crypto
    .createHmac("sha256", apiSecret)
    .update(stringToSign)
    .digest("hex");

  // Store validated data for logging
  req.authenticatedApiKey = apiKey;
  req.requestTimestamp = requestTime;
  req.requestNonce = nonce;

  // Validate nonce to prevent replay attacks
  if (!validateNonce(nonce)) {
    logger.warn(
      `Invalid nonce received: API Key: ${apiKey}, Timestamp: ${timestamp}, Nonce: ${nonce}`,
    );
    res.status(401).json({ error: "Nonce already used or invalid format" });
    return;
  }

  if (signature !== expectedSignature) {
    logger.warn(
      `Invalid request signature received: API Key: ${apiKey}, Timestamp: ${timestamp}, Nonce: ${nonce}`,
    );
    res.status(401).json({ error: "Invalid request signature" });
    return;
  }

  next();
};

// TODO: when using non-internal origins. Whitelist allowed origins (additional to CORS)
// export const validateOrigin = (allowedOrigins: string[]) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     const origin = req.headers.origin;
//     const forwarded = req.headers["x-forwarded-for"];
//     const realIp = req.headers["x-real-ip"];

//     // Log for monitoring
//     logger.info(
//       `Request from origin: ${origin}, IP: ${req.ip}, Forwarded: ${forwarded}, Real IP: ${realIp}`
//     );

//     // For local development, allow localhost
//     if (process.env.NODE_ENV === "development") {
//       const localhostPatterns = [
//         "http://localhost:3000",
//         "http://127.0.0.1:3000",
//         "http://localhost:3001",
//       ];

//       if (
//         !origin ||
//         localhostPatterns.some((pattern) => origin.startsWith(pattern))
//       ) {
//         return next();
//       }
//     }

//     // Production: strict origin validation
//     if (!origin || !allowedOrigins.includes(origin)) {
//       res.status(403).json({
//         error: "Forbidden origin",
//         hint: "Contact administrator to whitelist your domain",
//       });
//       return;
//     }
//     next();
//   };
// };

// Security headers middleware (OWASP recommended)
export const securityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY");

  // Enable XSS protection
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Strict transport security (HTTPS only)
  if (req.secure || req.headers["x-forwarded-proto"] === "https") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload",
    );
  }

  // Content Security Policy
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'none'; script-src 'none'; object-src 'none';",
  );

  // Referrer policy
  res.setHeader("Referrer-Policy", "no-referrer");

  next();
};
