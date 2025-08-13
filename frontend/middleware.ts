// Avoid using queries in the middleware, as Prisma does not work on the edge

import { apiAuthPrefix, publicRoutes } from "./routes";
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// middleware function which runs on all pages
// only checks if the user has a session cookie, if else redirect to login
// runs on the edge, so no database queries can be made
// running more extensive checks here is not recommended, as the middleware runs on every request
export async function middleware(req: NextRequest) {
  const sessionCookie = getSessionCookie(req, {
    cookiePrefix: "tillerquest",
  });

  const isApiRoute = req.nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname);
  // const isAuthRoute = authRoutes.includes(req.nextUrl.pathname);
  // const isAdminRoute = nextUrl.pathname.startsWith(adminPrefix);

  if (isApiRoute) {
    // if the user is on an auth route, we don't need to check for a session
    return null;
  }

  // THIS IS NOT SECURE!
  // This is the recommended approach to optimistically redirect users
  // We recommend handling auth checks in each page/route
  if (!sessionCookie && !isPublicRoute) {
    return NextResponse.redirect(new URL("/signup", req.url));
  }

  return null;
}

// better matcher from clerk.com, which runs middleware on all pages except static assets and api routes
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next|robots\\.txt).*)", "/", "/(api|trpc)(.*)"],
};
