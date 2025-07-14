import { auth } from "@/auth";
import { logger } from "./logger";
import { headers } from "next/headers";

export class AuthorizationError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage?: string,
  ) {
    super(message);
    this.name = "AuthorizationError";
  }
}

/**
 * Gets current session or throws authorization error
 */
const getCurrentSession = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    logger.warn("Unauthenticated access attempt. No session found.");
    throw new AuthorizationError(
      "User is not authenticated",
      "UNAUTHENTICATED",
      "You must be logged in to perform this action.",
    );
  }
  return session;
};

/**
 * Checks if the current user is authenticated.
 *
 * This function retrieves the current session using `auth()`. If there is no session,
 * it logs a warning and throws an `AuthorizationError` indicating the user is not authenticated.
 *
 * @returns The current session if the user is authenticated.
 * @throws AuthorizationError If the user is not authenticated.
 */
export const checkValidAuth = async () => {
  const session = await getCurrentSession();
  return session;
};

/**
 * Checks if the current authenticated user's ID matches the provided userId.
 *
 * This function retrieves the current session using `auth()`. If there is no session,
 * it logs a warning and throws an `AuthorizationError` indicating the user is not authenticated.
 * If the session exists but the user ID does not match the provided `userId`, it logs a warning
 * and throws an `AuthorizationError` indicating a user ID mismatch.
 *
 * @param userId - The user ID to check against the authenticated user's ID.
 * @throws AuthorizationError If the user is not authenticated or the user ID does not match.
 */
export const checkUserIdAuth = async (userId: string) => {
  const session = await getCurrentSession();

  if (session.user.id !== userId) {
    logger.warn(
      `User ID mismatch: session user ID ${session.user.id} does not match requested user ID ${userId}`,
    );
    throw new AuthorizationError(
      "User ID mismatch",
      "USER_ID_MISMATCH",
      "You do not have permission to access this user's data.",
    );
  }
  return session;
};

/**
 * Checks if the current user is authenticated and has admin privileges.
 *
 * @throws {AuthorizationError} Throws an error if the user is not authenticated or does not have admin permissions.
 * @returns {Promise<void>} Resolves if the user is authenticated and is an admin.
 *
 * @example
 * try {
 *   await checkAdminAuth();
 *   // Proceed with admin-only action
 * } catch (error) {
 *   // Handle unauthorized access
 * }
 */
export const checkAdminAuth = async () => {
  const session = await getCurrentSession();

  if (session.user.role !== "ADMIN") {
    logger.warn(
      `User ${session.user.id} attempted admin access without permissions`,
    );
    throw new AuthorizationError(
      "User is not an admin",
      "NOT_ADMIN",
      "You do not have permission to perform this action.",
    );
  }
  return session;
};

/**
 * Checks if the current user session is authorized to perform general actions.
 *
 * - Throws an `AuthorizationError` if the user is not authenticated.
 * - Throws an `AuthorizationError` if the user's role is `"NEW"`, indicating insufficient permissions.
 * - Logs warnings for unauthenticated or unauthorized access attempts.
 *
 * @throws {AuthorizationError} If the user is not authenticated or not authorized.
 * @returns {Promise<void>} Resolves if the user is authenticated and authorized.
 */
export const checkActiveUserAuth = async () => {
  const session = await getCurrentSession();

  if (session.user.role === "NEW") {
    logger.warn(
      `User ${session.user.id} is not authorized to perform this action`,
    );
    throw new AuthorizationError(
      "User is not authorized",
      "NOT_AUTHORIZED",
      "You do not have permission to perform this action.",
    );
  }
  return session;
};

/**
 * Checks if the current session's user ID matches the provided user ID and verifies that the user is fully activated.
 * Combined auth check for user ID and active status (optimization for common case).
 *
 * @param userId - The expected user ID to validate against the current session.
 * @returns The authenticated user object from the current session if validation passes.
 * @throws {AuthorizationError} If the user ID does not match the session's user ID.
 * @throws {AuthorizationError} If the user's role is "NEW" and the account is not fully activated.
 */
export const checkUserIdAndActiveAuth = async (userId: string) => {
  const session = await getCurrentSession();

  // Check user ID match
  if (session.user.id !== userId) {
    logger.warn("User ID mismatch detected");
    throw new AuthorizationError(
      "User ID mismatch",
      "USER_ID_MISMATCH",
      "You do not have permission to access this resource.",
    );
  }

  // Check active status
  if (session.user.role === "NEW") {
    logger.warn("NEW user attempted restricted action");
    throw new AuthorizationError(
      "User not fully activated",
      "USER_NOT_ACTIVATED",
      "Please complete your account setup to perform this action.",
    );
  }

  return session;
};

/**
 * Checks if the current session's username matches the provided username and verifies that the user is fully activated.
 * Combined auth check for username and active status (optimization for common case).
 *
 * @param username - The expected usernameto validate against the current session.
 * @returns The authenticated user object from the current session if validation passes.
 * @throws {AuthorizationError} If the username does not match the session's username.
 * @throws {AuthorizationError} If the user's role is "NEW" and the account is not fully activated.
 */
export const checkUsernameAndActiveAuth = async (username: string) => {
  const session = await getCurrentSession();

  // Check user ID match
  if (session.user.username !== username) {
    logger.warn("Username mismatch detected");
    throw new AuthorizationError(
      "Username mismatch",
      "USERNAME_MISMATCH",
      "You do not have permission to access this resource.",
    );
  }

  // Check active status
  if (session.user.role === "NEW") {
    logger.warn("NEW user attempted restricted action");
    throw new AuthorizationError(
      "User not fully activated",
      "USER_NOT_ACTIVATED",
      "Please complete your account setup to perform this action.",
    );
  }

  return session;
};

/**
 * Checks if the current session belongs to an authenticated user with the "NEW" role (for onboarding actions).
 *
 * @throws {AuthorizationError} If the user is not authenticated.
 * @throws {AuthorizationError} If the authenticated user does not have the "NEW" role.
 *
 * @remarks
 * This function is intended to restrict access to actions that should only be performed
 * by users who are newly registered or have not yet completed onboarding.
 * Logs a warning if an unauthenticated or unauthorized access attempt is detected.
 *
 * @example
 * ```typescript
 * await checkNewUserAuth();
 * // Proceed with actions for new users
 * ```
 */
export const checkNewUserAuth = async () => {
  const session = await getCurrentSession();

  if (session.user.role !== "NEW") {
    logger.warn(
      `User ${session.user.id} attempted new user access without permissions`,
    );
    throw new AuthorizationError(
      "User is not a new user",
      "NOT_NEW_USER",
      "You do not have permission to perform this action.",
    );
  }
  return session;
};
