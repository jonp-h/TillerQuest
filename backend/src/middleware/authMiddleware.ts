import { Request, Response, NextFunction } from "express";
import { auth } from "../auth.js";
import { fromNodeHeaders } from "better-auth/node";
import { logger } from "../lib/logger.js";

// Extend Express Request type to include session
declare global {
  namespace Express {
    interface Request {
      session?: {
        user: {
          id: string;
          email: string;
          name: string;
          image?: string | null;
          username: string;
          role: string;
          class: string;
          emailVerified: boolean;
          createdAt: Date;
          updatedAt: Date;
        };
        session: {
          id: string;
          userId: string;
          expiresAt: Date;
          token: string;
          ipAddress?: string | null;
          userAgent?: string | null;
        };
      };
    }
  }
}

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      logger.warn(
        `Unauthenticated access attempt to ${req.path} from IP ${req.ip}`,
        {
          path: req.path,
          method: req.method,
          ip: req.ip,
          userAgent: req.get("user-agent"),
        },
      );
      res.status(401).json({
        error: "Authentication required",
        code: "UNAUTHENTICATED",
      });
      return;
    }

    // Attach session to request for downstream middleware
    req.session = session;
    next();
  } catch (error) {
    logger.error("Auth middleware error:", error);

    res.status(500).json({
      error: "Authentication error",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Validates that authenticated user is not in NEW role (account fully activated)
 *
 * Depends on: requireAuth (must be chained after)
 *
 * @example
 * router.post('/ability/use', requireAuth, requireActiveUser, abilityController)
 */
export const requireActiveUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Session must exist from requireAuth middleware
  if (!req.session?.user) {
    logger.error(
      "requireActiveUser called without session - check middleware order",
    );
    res.status(500).json({
      error: "Internal server error",
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (req.session.user.role === "NEW") {
    logger.warn(
      `NEW user ${req.session.user.id} attempted restricted action at ${req.path}`,
      {
        userId: req.session.user.id,
        path: req.path,
        method: req.method,
      },
    );
    res.status(403).json({
      error: "You do not have permission to perform this action.",
      code: "USER_NOT_ACTIVATED",
    });
    return;
  }

  next();
};

/**
 * Validates that authenticated user has ADMIN role
 *
 * Depends on: requireAuth (must be chained after)
 *
 * @example
 * router.delete('/user/:id', requireAuth, requireAdmin, deleteUserController)
 */
export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.session?.user) {
    logger.error(
      "requireAdmin called without session - check middleware order",
    );
    res.status(500).json({
      error: "Internal server error",
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (req.session.user.role !== "ADMIN") {
    logger.warn(
      `User ${req.session.user.id} attempted admin access at ${req.path}`,
      {
        userId: req.session.user.id,
        role: req.session.user.role,
        path: req.path,
        method: req.method,
        ip: req.ip,
      },
    );
    //  Use generic error message
    res.status(403).json({
      error: "You do not have permission to perform this action.",
      code: "FORBIDDEN",
    });
    return;
  }

  next();
};

/**
 * Validates that authenticated user has NEW role (for onboarding endpoints)
 *
 * Depends on: requireAuth (must be chained after)
 *
 * @example
 * router.post('/onboarding/complete', requireAuth, requireNewUser, completeOnboardingController)
 */
export const requireNewUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.session?.user) {
    logger.error(
      "requireNewUser called without session - check middleware order",
    );
    res.status(500).json({
      error: "Internal server error",
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (req.session.user.role !== "NEW") {
    logger.warn(
      `Non-NEW user ${req.session.user.id} attempted new-user-only action at ${req.path}`,
      {
        userId: req.session.user.id,
        role: req.session.user.role,
        path: req.path,
      },
    );
    res.status(403).json({
      error: "You do not have permission to perform this action.",
      code: "NOT_NEW_USER",
    });
    return;
  }

  next();
};

/**
 * Factory function to create middleware that validates user owns the resource
 * Prevents horizontal privilege escalation (accessing other users' data)
 *
 * Depends on: requireAuth (must be chained after)
 *
 * @param paramName - The route parameter name containing the user ID (default: 'userId')
 * @returns Express middleware function
 *
 * @example
 * Route: /user/:userId/profile
 * router.get('/user/:userId/profile', requireAuth, requireUserId(), getUserProfileController)
 *
 * Custom param name: /profile/:id
 * router.get('/profile/:id', requireAuth, requireUserId('id'), getUserProfileController)
 */
export const requireUserId = (paramName: string = "userId") => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.session?.user) {
      logger.error(
        "requireUserId called without session - check middleware order",
      );
      res.status(500).json({
        error: "Internal server error",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const targetUserId = req.params[paramName];

    // OWASP A03:2021 – Injection Prevention
    // Validate that userId parameter exists and is properly formatted
    if (!targetUserId || typeof targetUserId !== "string") {
      logger.warn("Invalid or missing user ID parameter", {
        paramName,
        path: req.path,
      });
      res.status(400).json({
        error: "Invalid request",
        code: "INVALID_PARAMETER",
      });
      return;
    }

    // OWASP A01:2021 – Prevent horizontal privilege escalation
    if (req.session.user.id !== targetUserId) {
      logger.warn(
        `User ${req.session.user.id} attempted to access user ${targetUserId}'s resource at ${req.path}`,
        {
          sessionUserId: req.session.user.id,
          targetUserId,
          path: req.path,
          method: req.method,
          ip: req.ip,
        },
      );
      // Generic error message - don't reveal if user exists
      res.status(403).json({
        error: "You do not have permission to access this resource.",
        code: "FORBIDDEN",
      });
      return;
    }

    next();
  };
};

/**
 * Factory function to create middleware that validates user owns the resource by username
 *
 * Depends on: requireAuth (must be chained after)
 *
 * @param paramName - The route parameter name containing the username (default: 'username')
 * @returns Express middleware function
 *
 * @example
 * Route: /user/:username/stats
 * router.get('/user/:username/stats', requireAuth, requireUsername(), getUserStatsController)
 */
export const requireUsername = (paramName: string = "username") => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.session?.user) {
      logger.error(
        "requireUsername called without session - check middleware order",
      );
      res.status(500).json({
        error: "Internal server error",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const targetUsername = req.params[paramName];

    if (!targetUsername || typeof targetUsername !== "string") {
      logger.warn("Invalid or missing username parameter", {
        paramName,
        path: req.path,
      });
      res.status(400).json({
        error: "Invalid request",
        code: "INVALID_PARAMETER",
      });
      return;
    }

    if (req.session.user.username !== targetUsername) {
      logger.warn(
        `User ${req.session.user.username} attempted to access ${targetUsername}'s resource at ${req.path}`,
        {
          sessionUsername: req.session.user.username,
          targetUsername,
          path: req.path,
          method: req.method,
          ip: req.ip,
        },
      );
      res.status(403).json({
        error: "You do not have permission to access this resource.",
        code: "FORBIDDEN",
      });
      return;
    }

    next();
  };
};

// ------------------ COMBINED MIDDLEWARE ------------------------

/**
 * Combined middleware: requireAuth + requireActiveUser + requireUserId
 * Optimized for common use case of user-specific endpoints
 *
 * @param paramName - The route parameter name containing the user ID (default: 'userId')
 *
 * @example
 * router.post('/user/:userId/ability', requireUserIdAndActive(), useAbilityController)
 */
export const requireUserIdAndActive = (paramName: string = "userId") => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Step 1: Verify authentication
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });

      if (!session?.user) {
        logger.warn(
          `Unauthenticated access attempt to ${req.path} from IP ${req.ip}`,
        );
        res.status(401).json({
          error: "Authentication required",
          code: "UNAUTHENTICATED",
        });
        return;
      }

      req.session = session;

      // Step 2: Validate user ID match
      const targetUserId = req.params[paramName];

      if (!targetUserId || typeof targetUserId !== "string") {
        logger.warn("Invalid or missing user ID parameter", {
          paramName,
          path: req.path,
        });
        res.status(400).json({
          error: "Invalid request",
          code: "INVALID_PARAMETER",
        });
        return;
      }

      if (session.user.id !== targetUserId) {
        logger.warn(
          `User ${session.user.id} attempted to access user ${targetUserId}'s resource`,
          {
            sessionUserId: session.user.id,
            targetUserId,
            path: req.path,
          },
        );
        res.status(403).json({
          error: "You do not have permission to access this resource.",
          code: "FORBIDDEN",
        });
        return;
      }

      // Step 3: Validate active user
      if (session.user.role === "NEW") {
        logger.warn(
          `NEW user ${session.user.id} attempted restricted action at ${req.path}`,
        );
        res.status(403).json({
          error: "Please complete your account setup to perform this action.",
          code: "USER_NOT_ACTIVATED",
        });
        return;
      }

      next();
    } catch (error) {
      logger.error("Auth middleware error:", error);
      res.status(500).json({
        error: "Authentication error",
        timestamp: new Date().toISOString(),
      });
    }
  };
};

/**
 * Combined middleware: requireAuth + requireActiveUser + requireUsername
 * Optimized for username-based endpoints
 *
 * @param paramName - The route parameter name containing the username (default: 'username')
 *
 * @example
 * router.post('/profile/:username/update', requireUsernameAndActive(), updateProfileController)
 */
export const requireUsernameAndActive = (paramName: string = "username") => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });

      if (!session?.user) {
        logger.warn(
          `Unauthenticated access attempt to ${req.path} from IP ${req.ip}`,
        );
        res.status(401).json({
          error: "Authentication required",
          code: "UNAUTHENTICATED",
        });
        return;
      }

      req.session = session;

      const targetUsername = req.params[paramName];

      if (!targetUsername || typeof targetUsername !== "string") {
        logger.warn("Invalid or missing username parameter", {
          paramName,
          path: req.path,
        });
        res.status(400).json({
          error: "Invalid request",
          code: "INVALID_PARAMETER",
        });
        return;
      }

      if (session.user.username !== targetUsername) {
        logger.warn(
          `User ${session.user.username} attempted to access ${targetUsername}'s resource`,
          {
            sessionUsername: session.user.username,
            targetUsername,
            path: req.path,
          },
        );
        res.status(403).json({
          error: "You do not have permission to access this resource.",
          code: "FORBIDDEN",
        });
        return;
      }

      if (session.user.role === "NEW") {
        logger.warn(
          `NEW user ${session.user.id} attempted restricted action at ${req.path}`,
        );
        res.status(403).json({
          error: "Please complete your account setup to perform this action.",
          code: "USER_NOT_ACTIVATED",
        });
        return;
      }

      next();
    } catch (error) {
      logger.error("Auth middleware error:", error);
      res.status(500).json({
        error: "Authentication error",
        timestamp: new Date().toISOString(),
      });
    }
  };
};

/**
 * Combined middleware: requireAuth + requireNewUser + requireUserId
 * For onboarding endpoints that require user ID validation
 *
 * @param paramName - The route parameter name containing the user ID (default: 'userId')
 *
 * @example
 * router.post('/onboarding/:userId/class', requireUserIdAndNew(), selectClassController)
 */
export const requireUserIdAndNew = (paramName: string = "userId") => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });

      if (!session?.user) {
        logger.warn(
          `Unauthenticated access attempt to ${req.path} from IP ${req.ip}`,
        );
        res.status(401).json({
          error: "Authentication required",
          code: "UNAUTHENTICATED",
        });
        return;
      }

      req.session = session;

      const targetUserId = req.params[paramName];

      if (!targetUserId || typeof targetUserId !== "string") {
        logger.warn("Invalid or missing user ID parameter", {
          paramName,
          path: req.path,
        });
        res.status(400).json({
          error: "Invalid request",
          code: "INVALID_PARAMETER",
        });
        return;
      }

      if (session.user.id !== targetUserId) {
        logger.warn(
          `User ${session.user.id} attempted to access user ${targetUserId}'s resource`,
          {
            sessionUserId: session.user.id,
            targetUserId,
            path: req.path,
          },
        );
        res.status(403).json({
          error: "You do not have permission to access this resource.",
          code: "FORBIDDEN",
        });
        return;
      }

      if (session.user.role !== "NEW") {
        logger.warn(
          `Non-NEW user ${session.user.id} attempted new-user-only action at ${req.path}`,
        );
        res.status(403).json({
          error: "You do not have permission to perform this action.",
          code: "NOT_NEW_USER",
        });
        return;
      }

      next();
    } catch (error) {
      logger.error("Auth middleware error:", error);
      res.status(500).json({
        error: "Authentication error",
        timestamp: new Date().toISOString(),
      });
    }
  };
};
