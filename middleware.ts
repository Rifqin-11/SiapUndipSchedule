import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for auth, api, static files, and splash
  if (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/splash") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Check if user has visited splash screen
  const hasVisitedSplash = request.cookies.get("visited-splash")?.value;

  // If not visited splash and accessing root, redirect to splash
  if (!hasVisitedSplash && pathname === "/") {
    const response = NextResponse.redirect(new URL("/splash", request.url));
    // Set cookie to remember user has seen splash
    response.cookies.set("visited-splash", "true", {
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
