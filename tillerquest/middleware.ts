import authConfig from "./auth.config";
import NextAuth from "next-auth";
import {
  apiAuthPrefix,
  publicRoutes,
  authRoutes,
  DEFAULT_LOGIN_REDIRECT,
  adminPrefix,
} from "./routes";
import { UserRole } from "@prisma/client";
import { getUserById } from "./data/user";
import { getSession, useSession } from "next-auth/react";
import { NextRequest, NextResponse } from "next/server";
import { INTERNALS } from "next/dist/server/web/spec-extension/request";

export const { auth } = NextAuth(authConfig);

// middleware function which runs on all pages
export default auth(async (req) => {
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

  // if user is logged in and tries to route to login, redirect to default login redirect (profile)
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
