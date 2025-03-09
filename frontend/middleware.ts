// Will update session expiry every time it is called
// Avoid using queries in the middleware, as Prisma does not work on the edge

import NextAuth from "next-auth";
import authConfig from "./auth.config";
import {
  adminPrefix,
  apiAuthPrefix,
  authRoutes,
  DEFAULT_CREATION_PAGE,
  DEFAULT_LOGIN_REDIRECT,
  publicRoutes,
} from "./routes";
import { auth as middleware } from "./auth";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { auth } = NextAuth(authConfig);

// middleware function which runs on all pages
// changed from auth to middleware to fulfill auth import
// this gives access to req.auth
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default middleware(async (req): Promise<any> => {
  const { nextUrl } = req;
  // double negation to convert to boolean
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isAdminRoute = nextUrl.pathname.startsWith(adminPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  // if route is api/auth, do not redirect
  if (isApiAuthRoute) {
    return null;
  }

  // if user's role is NEW redirect to user creation page. Do not redirect if already on creation page
  if (req.auth?.user?.role === "NEW") {
    if (req.nextUrl.pathname === DEFAULT_CREATION_PAGE) {
      return null;
    }
    console.log("redirecting to create, new user");
    return Response.redirect(new URL(DEFAULT_CREATION_PAGE, nextUrl));
  }

  // if user's role is not ADMIN redirect to profile page
  if (isAdminRoute && req.auth?.user.role !== "ADMIN") {
    console.log("redirecting to profile, no admin");

    return Response.redirect(
      new URL(DEFAULT_LOGIN_REDIRECT + "?redirected=true", nextUrl),
    );
  }

  // if user is logged in and tries to route to login or creation page, redirect to default login redirect (profile)
  if (isAuthRoute || nextUrl.pathname === DEFAULT_CREATION_PAGE) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
  }

  // FIXME: currently unused callbackUrl
  // Could potentially use callback to give not authorized redirect information
  // if user is not logged in and route is not public, redirect to login
  if (!isLoggedIn && !isPublicRoute) {
    // let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      // callbackUrl += nextUrl.search;
    }
    return Response.redirect(new URL("/", nextUrl));
  }

  return null;
});

// better matcher from clerk.com, which runs middleware on all pages except static assets and api routes
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next|robots\\.txt).*)", "/", "/(api|trpc)(.*)"],
};
