import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/auth/login",
    "/auth/register",
    "/api/auth",
    "/api/auth/register",
    "/api/auth/verify",
  ];

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // If user is not authenticated and trying to access a protected route
  if (!req.auth && !isPublicRoute) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // If user is authenticated and trying to access auth pages, redirect to home
  if (
    req.auth &&
    (pathname.startsWith("/auth/login") ||
      pathname.startsWith("/auth/register"))
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
