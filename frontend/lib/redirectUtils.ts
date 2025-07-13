import { redirect } from "next/navigation";
import { logger } from "./logger";
import { auth } from "@/auth";
import { headers } from "next/headers";

/**
 * Redirects unauthenticated users to the sign-in page
 */
const requireAuth = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    logger.warn("Unauthenticated user redirected to sign-up");
    redirect(`/signup`);
  }

  return session;
};

/**
 * Redirects users with "NEW" role to a specified page
 */
export const redirectIfNewUser = async (redirectTo: string = "/create") => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session && session.user.role === "NEW") {
    redirect(redirectTo);
  }

  return session;
};

/**
 * Redirects users who don't have admin role
 */
export const requireAdmin = async (redirectTo: string = "/") => {
  const session = await requireAuth();

  if (session.user.role !== "ADMIN") {
    logger.warn(
      `Non-admin user ${session.user.username}(${session.user.id}) redirected from admin area`,
    );
    redirect(redirectTo);
  }

  return session;
};

/**
 * Redirects users with "NEW" role (not fully activated) to the creation page
 */
export const requireActiveUser = async (redirectTo: string = "/create") => {
  const session = await requireAuth();

  if (session.user.role === "NEW") {
    logger.warn(
      `NEW user ${session.user.username}(${session.user.id}) redirected to complete onboarding`,
    );
    redirect(redirectTo);
  }

  return session;
};

/**
 * Redirects users who are NOT new (for onboarding pages)
 */
export const requireNewUser = async (redirectTo: string = "/") => {
  const session = await requireAuth();

  if (session.user.role !== "NEW") {
    logger.warn(
      `Non-new user ${session.user.username}(${session.user.id}) redirected from create page`,
    );
    redirect(redirectTo);
  }

  return session;
};

/**
 * Redirects users who don't match the required user ID
 */
export const requireUserId = async (
  userId: string,
  redirectTo: string = "/",
) => {
  const session = await requireAuth();

  if (session.user.id !== userId) {
    logger.warn(
      `User ${session.user.username}(${session.user.id}) attempted to access resource for user ${userId}`,
    );
    redirect(redirectTo);
  }

  return session;
};

/**
 * Combined check: require auth + active user + matching user ID
 */
export const requireUserAccess = async (
  userId: string,
  redirectTo: string = "/",
) => {
  const session = await requireAuth();

  if (session.user.id !== userId) {
    logger.warn(
      `User ${session.user.username}(${session.user.id}) attempted to access resource for user ${userId}`,
    );
    redirect(redirectTo);
  }

  if (session.user.role === "NEW") {
    redirect("/create");
  }

  return session;
};

/**
 * Combined check: require auth + active user + matching username
 */
export const requireAccessAndUsername = async (
  username: string,
  redirectTo: string = "/",
) => {
  const session = await requireAuth();

  if (session.user.username !== username) {
    logger.warn(
      `User ${session.user.username}(${session.user.id}) attempted to access resource for user ${username}`,
    );
    redirect(redirectTo);
  }

  if (session.user.role === "NEW") {
    redirect("/create");
  }

  return session;
};
