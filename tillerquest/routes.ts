//JSDoc: tillerquest/routes.ts

/**
 * Array of routes that are accessible to the public.
 * These routes do not require authentication.
 * @type {string[]}
 */
export const publicRoutes = ["/", "/signup"];

/**
 * Routes that handle login and registration.
 * These routes do not require authentication.
 * @type {string[]}
 */
export const authRoutes = ["/auth/login", "/auth/error"];

/**
 * The prefix for API authentication routes.
 * Routes that start with this prefix are used for API authentication.
 * These routes need to be accessible by the public.
 * @type {string}
 */
export const apiAuthPrefix = "/api/auth";

/**
 * The prefix for admin authentication routes.
 * Routes that start with this prefix are used for admin authentication.
 * These routes should be protected and only accessible by admins.
 * @type {string}
 */
export const adminPrefix = "/gamemaster";

/**
 * Route to redirect to after login.
 * The default for this is the profile page.
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT = "/";

/**
 * Route for user creation page.
 * The default for this is the create page.
 * @type {string}
 */
export const DEFAULT_CREATION_PAGE = "/create";
