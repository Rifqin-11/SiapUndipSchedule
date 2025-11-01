import { NextResponse } from "next/server";

/**
 * Cache configuration untuk berbagai tipe content
 */
export const CACHE_CONFIG = {
  // Data yang jarang berubah (subjects, user profile)
  LONG: "public, s-maxage=300, stale-while-revalidate=600", // 5 menit fresh, 10 menit stale

  // Data yang sering berubah (tasks, attendance)
  SHORT: "public, s-maxage=120, stale-while-revalidate=300", // 2 menit fresh, 5 menit stale

  // Data real-time (notifications)
  IMMEDIATE: "public, s-maxage=30, stale-while-revalidate=60", // 30 detik fresh, 1 menit stale

  // Static assets (images, files)
  STATIC: "public, max-age=31536000, immutable", // 1 tahun

  // No cache
  NO_CACHE: "no-cache, no-store, must-revalidate",
} as const;

/**
 * Helper untuk membuat response dengan cache headers
 */
export function createCachedResponse<T>(
  data: T,
  cacheType: keyof typeof CACHE_CONFIG = "LONG",
  status: number = 200
) {
  const response = NextResponse.json(data, { status });
  response.headers.set("Cache-Control", CACHE_CONFIG[cacheType]);

  // Tambah ETag untuk conditional requests
  const etag = Buffer.from(JSON.stringify(data)).toString("base64");
  response.headers.set("ETag", `"${etag}"`);

  return response;
}

/**
 * Helper untuk error response tanpa cache
 */
export function createErrorResponse(error: string, status: number = 500) {
  const response = NextResponse.json({ success: false, error }, { status });
  response.headers.set("Cache-Control", CACHE_CONFIG.NO_CACHE);
  return response;
}

/**
 * Helper untuk check conditional requests
 */
export function checkConditionalRequest(
  request: Request,
  data: any
): Response | null {
  const ifNoneMatch = request.headers.get("if-none-match");

  if (ifNoneMatch) {
    const etag = Buffer.from(JSON.stringify(data)).toString("base64");
    if (ifNoneMatch === `"${etag}"`) {
      // Data tidak berubah, return 304 Not Modified
      return new Response(null, {
        status: 304,
        headers: {
          "Cache-Control": CACHE_CONFIG.LONG,
          ETag: `"${etag}"`,
        },
      });
    }
  }

  return null;
}
