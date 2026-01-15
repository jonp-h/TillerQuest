import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";
import { logger } from "../lib/logger.js";

// In-memory store for user rate limiting
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const userRateLimits = new Map<string, RateLimitRecord>();

// Cleanup old entries every hour to prevent memory leaks
setInterval(
  () => {
    const now = Date.now();
    for (const [userId, record] of userRateLimits.entries()) {
      if (record.resetAt < now) {
        userRateLimits.delete(userId);
      }
    }
  },
  60 * 60 * 1000,
); // 1 hour

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;
  skipSuccessfulRequests?: boolean;
}

/**
 * Per-user rate limiting middleware
 * Must be used AFTER requireAuth middleware
 *
 * @example
 * // Allow 200 requests per 5 minutes per user
 * app.use('/api/v1', requireAuth, userRateLimit({
 *   windowMs: 5 * 60 * 1000,
 *   maxRequests: 200
 * }));
 */
export const userRateLimit = (options: RateLimitOptions) => {
  const {
    windowMs,
    maxRequests,
    message = "Too many requests, please try again later",
    skipSuccessfulRequests = false,
  } = options;

  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Requires auth middleware to run first
    if (!req.session?.user?.id) {
      logger.error("userRateLimit called before requireAuth middleware");
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    const userId = req.session.user.id;
    const now = Date.now();

    // Get or create rate limit record
    let record = userRateLimits.get(userId);

    if (!record || record.resetAt < now) {
      // Create new record or reset expired one
      record = {
        count: 0,
        resetAt: now + windowMs,
      };
      userRateLimits.set(userId, record);
    }

    // Check if limit exceeded
    if (record.count >= maxRequests) {
      const retryAfter = Math.ceil((record.resetAt - now) / 1000);

      logger.warn(`Rate limit exceeded for user ${userId}`, {
        userId,
        path: req.path,
        count: record.count,
        limit: maxRequests,
        resetAt: new Date(record.resetAt).toISOString(),
      });

      res.status(429).json({
        error: message,
        retryAfter,
        limit: maxRequests,
        windowMs,
      });
      return;
    }

    // Increment count
    record.count++;

    // Set rate limit headers
    res.setHeader("X-RateLimit-Limit", maxRequests.toString());
    res.setHeader(
      "X-RateLimit-Remaining",
      (maxRequests - record.count).toString(),
    );
    res.setHeader("X-RateLimit-Reset", new Date(record.resetAt).toISOString());

    // Optionally reset count if request is successful
    if (skipSuccessfulRequests) {
      res.on("finish", () => {
        if (res.statusCode < 400) {
          const currentRecord = userRateLimits.get(userId);
          if (currentRecord) {
            currentRecord.count = Math.max(0, currentRecord.count - 1);
          }
        }
      });
    }

    next();
  };
};

/**
 * Aggressive rate limiting for expensive endpoints
 * Example: File uploads, complex queries
 */
export const strictUserRateLimit = userRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute
  message: "This endpoint is rate limited. Please slow down.",
});

/**
 * Standard rate limiting for authenticated API routes
 * Designed for classroom use: 100 users on same IP
 */
export const standardUserRateLimit = userRateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 200, // 200 requests per 5 minutes per user
  // 40 req/min or ~1.5 sec between requests with some burst capacity
});

/**
 * Lenient rate limiting for frequently used endpoints
 * Example: Status checks, live data feeds
 */
export const lenientUserRateLimit = userRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute (1 per second)
});
