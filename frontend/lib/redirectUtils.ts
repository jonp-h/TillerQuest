import { redirect } from "next/navigation";
import { logger } from "./logger";
import { cookies } from "next/headers";

type BackendSessionResponse = {
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
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
};

/**
 * Fetches session from backend with proper cookie forwarding for server components
 * @returns Session and user data from the backend, or null if not authenticated
 */
async function getSessionFromBackend(): Promise<BackendSessionResponse | null> {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    // TODO: ensure security of fetch
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/get-session`,
      {
        credentials: "include",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
        },
      },
    );

    if (response.ok) {
      const data = await response.json();

      return data.user ? data : null;
    }

    return null;
  } catch (error) {
    logger.error("Failed to fetch session from backend:", error);
    return null;
  }
}

/**
 * Redirects unauthenticated users to the sign-in page
 * @returns Session data with user and session objects
 */
const redirectIfUnauthenticated = async (): Promise<BackendSessionResponse> => {
  const session = await getSessionFromBackend();

  if (!session?.user) {
    logger.warn("Unauthenticated user redirected to sign-up");
    redirect(`/signup`);
  }

  return session;
};

/**
 * Redirects users with "NEW" role to a specified page
 * @param redirectTo - The path to redirect to (default: /create)
 * @returns Session data if user is not new, or redirects
 */
export const redirectIfNewOrInactiveUser =
  async (): Promise<BackendSessionResponse | null> => {
    const session = await getSessionFromBackend();

    if (session?.user.role === "NEW") {
      logger.info(
        `NEW user ${session.user.username}(${session.user.id}) redirected to "/create"`,
      );
      redirect("/create");
    }

    if (session?.user.role === "INACTIVE") {
      logger.info(
        `INACTIVE user ${session.user.username}(${session.user.id}) redirected to "/reset"`,
      );
      redirect("/reset");
    }

    return session;
  };

/**
 * Redirects users who don't have admin role
 * @param redirectTo - The path to redirect to (default: /)
 * @returns Session data if user is admin, or redirects
 */
export const redirectIfNotAdmin = async (
  redirectTo: string = "/",
): Promise<BackendSessionResponse> => {
  const session = await redirectIfUnauthenticated();

  if (session.user.role !== "ADMIN") {
    logger.warn(
      `Non-admin user ${session.user.username}(${session.user.id}) redirected from admin area`,
    );
    redirect(redirectTo);
  }

  return session;
};

/**
 * Redirects users with "NEW" or "INACTIVE" role (not fully activated) to the appropriate page
 * @returns Session data if user is active, or redirects
 */
export const redirectIfNotActiveUser =
  async (): Promise<BackendSessionResponse> => {
    const session = await redirectIfUnauthenticated();

    if (session.user.role === "NEW") {
      logger.warn(
        `NEW user ${session.user.username}(${session.user.id}) redirected to complete onboarding`,
      );
      redirect("/create");
    }

    if (session.user.role === "INACTIVE") {
      logger.warn(
        `INACTIVE user ${session.user.username}(${session.user.id}) redirected to reset page`,
      );
      redirect("/reset");
    }

    return session;
  };

/**
 * Redirects users who are NOT new (for onboarding pages)
 * @param redirectTo - The path to redirect to (default: /)
 * @returns Session data if user is new, or redirects
 */
export const redirectIfNotNewUser = async (
  redirectTo: string = "/",
): Promise<BackendSessionResponse> => {
  const session = await redirectIfUnauthenticated();

  if (session.user.role !== "NEW") {
    logger.warn(
      `Non-new user ${session.user.username}(${session.user.id}) redirected from create page`,
    );
    redirect(redirectTo);
  }

  return session;
};

/**
 * Redirects users who are NOT inactive (for reset page)
 * @param redirectTo - The path to redirect to (default: /)
 * @returns Session data if user is inactive, or redirects
 */
export const redirectIfNotInactiveUser = async (
  redirectTo: string = "/",
): Promise<BackendSessionResponse> => {
  const session = await getSessionFromBackend();

  if (!session?.user) {
    logger.warn("Unauthenticated user redirected to sign-up");
    redirect(`/signup`);
  }

  if (session.user.role !== "INACTIVE") {
    logger.warn(
      `Non-inactive user ${session.user.username}(${session.user.id}) redirected from reset page`,
    );
    redirect(redirectTo);
  }

  return session;
};

/**
 * Redirects users who don't match the required user ID
 * @param userId - The required user ID to match
 * @param redirectTo - The path to redirect to (default: /)
 * @returns Session data if user ID matches, or redirects
 */
export const redirectIfWrongUserId = async (
  userId: string,
  redirectTo: string = "/",
): Promise<BackendSessionResponse> => {
  const session = await redirectIfUnauthenticated();

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
 * @param userId - The required user ID to match
 * @param redirectTo - The path to redirect to if user ID doesn't match (default: /)
 * @returns Session data if user is authenticated, active, and ID matches, or redirects
 */
export const redirectIfWrongUserIdOrNotActiveUser = async (
  userId: string,
  redirectTo: string = "/",
): Promise<BackendSessionResponse> => {
  const session = await redirectIfUnauthenticated();

  if (session.user.id !== userId) {
    logger.warn(
      `User ${session.user.username}(${session.user.id}) attempted to access resource for user ${userId}`,
    );
    redirect(redirectTo);
  }

  if (session.user.role === "NEW") {
    logger.warn(
      `NEW user ${session.user.username}(${session.user.id}) redirected to complete onboarding`,
    );
    redirect("/create");
  }

  if (session.user.role === "INACTIVE") {
    logger.warn(
      `INACTIVE user ${session.user.username}(${session.user.id}) redirected to reset page`,
    );
    redirect("/reset");
  }

  return session;
};

/**
 * Combined check: require auth + active user + matching username
 * @param username - The required username to match
 * @param redirectTo - The path to redirect to if username doesn't match (default: /)
 * @returns Session data if user is authenticated, active, and username matches, or redirects
 */
export const redirectIfWrongUsernameOrNotActiveUser = async (
  username: string,
  redirectTo: string = "/",
): Promise<BackendSessionResponse> => {
  const session = await redirectIfUnauthenticated();

  if (session.user.username !== username) {
    logger.warn(
      `User ${session.user.username}(${session.user.id}) attempted to access resource for user ${username}`,
    );
    redirect(redirectTo);
  }

  if (session.user.role === "NEW") {
    logger.warn(
      `NEW user ${session.user.username}(${session.user.id}) redirected to complete onboarding`,
    );
    redirect("/create");
  }

  if (session.user.role === "INACTIVE") {
    logger.warn(
      `INACTIVE user ${session.user.username}(${session.user.id}) redirected to reset page`,
    );
    redirect("/reset");
  }

  return session;
};
