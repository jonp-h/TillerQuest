import authConfig from "./auth.config";
import NextAuth from "next-auth";
import {
  apiAuthPrefix,
  publicRoutes,
  authRoutes,
  DEFAULT_LOGIN_REDIRECT,
} from "./routes";
import { NextRequest, NextResponse } from "next/server";

export const { auth } = NextAuth(authConfig);

// middleware function which runs on all pages
export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  // if route is api/auth, do not redirect
  if (isApiAuthRoute) {
    return null;
  }

  // if user is logged in and route is public, redirect to default login redirect
  if (isAuthRoute) {
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
