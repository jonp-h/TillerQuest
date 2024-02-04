import authConfig from "./auth.config";
import NextAuth from "next-auth";
import {
  apiAuthPrefix,
  publicRoutes,
  authRoutes,
  DEFAULT_LOGIN_REDIRECT,
  adminPrefix,
  DEFAULT_CREATION_PAGE,
} from "./routes";
import { auth as middleware } from "./auth";

export const { auth } = NextAuth(authConfig);

// middleware function which runs on all pages
// changed from auth to middleware to fulfill auth import
// this gives access to req.auth
export default middleware(async (req) => {
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

  // if user's role is NEW redirect to user creation page
  if (
    nextUrl.pathname !== DEFAULT_CREATION_PAGE &&
    req.auth?.user.role === "NEW"
  ) {
    return Response.redirect(new URL(DEFAULT_CREATION_PAGE, nextUrl));
  }

  // if user's role is not ADMIN redirect to profile page
  if (isAdminRoute && req.auth?.user.role !== "ADMIN") {
    return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
  }

  // if user is logged in and tries to route to login or creation page, redirect to default login redirect (profile)
  if (isAuthRoute || nextUrl.pathname === DEFAULT_CREATION_PAGE) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return null;
  }

  // if user is not logged in and route is not public, redirect to login
  if (!isLoggedIn && !isPublicRoute) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }
    return Response.redirect(new URL(`/auth/login`, nextUrl));
  }

  return null;
});

// better matcher from clerk.com, which runs middleware on all pages except static assets and api routes
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
