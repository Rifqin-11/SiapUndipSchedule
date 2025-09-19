import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for auth, api, static files, splash, and offline
  if (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/splash") ||
    pathname === "/offline" ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Check for offline header from service worker
  const isOfflineRequest = request.headers.get("X-Offline-Request") === "true";

  // If this is an offline request for a page, redirect to offline page
  if (isOfflineRequest && !pathname.startsWith("/offline")) {
    return NextResponse.redirect(new URL("/offline", request.url));
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
