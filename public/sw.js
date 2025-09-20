/* eslint-disable @typescript-eslint/no-explicit-any */
// Service Worker for

// Function to warmup critical endpoints
async function warmupCriticalEndpoints() {
  console.log("[ServiceWorker] Warming up critical endpoints");

  const warmupPromises = WARMUP_ENDPOINTS.map(async (endpoint) => {
    try {
      const response = await fetch(endpoint, {
        method: "GET",
        credentials: "include",
        cache: "no-cache",
      });

      if (response.ok) {
        console.log(`[ServiceWorker] Warmed up: ${endpoint}`);

        // Cache the warmup response if it's cacheable
        if (CACHEABLE_API_ROUTES.includes(endpoint)) {
          const cache = await caches.open(API_CACHE_NAME);
          await cache.put(endpoint, response.clone());
        }
      }
    } catch (error) {
      console.warn(`[ServiceWorker] Warmup failed for ${endpoint}:`, error);
    }
  });

  await Promise.allSettled(warmupPromises);
}
// Provides advanced offline support with smart caching strategies

const CACHE_NAME = "siap-undip-v1";
const STATIC_CACHE_NAME = "siap-undip-static-v1";
const DYNAMIC_CACHE_NAME = "siap-undip-dynamic-v1";
const API_CACHE_NAME = "siap-undip-api-v1";

// Cache duration constants (in milliseconds)
const CACHE_DURATION = {
  STATIC: 30 * 24 * 60 * 60 * 1000, // 30 days
  API: 5 * 60 * 1000, // 5 minutes
  DYNAMIC: 24 * 60 * 60 * 1000, // 1 day
};

// Assets to cache immediately
const STATIC_ASSETS = [
  "/",
  "/offline",
  "/manifest.json",
  "/icon-192x192.png",
  "/icon-512x512.png",
  "/favicon.ico",
];

// API endpoints that should be cached
const CACHEABLE_API_ROUTES = [
  "/api/subjects",
  "/api/tasks",
  "/api/schedule",
  "/api/user/profile",
  "/api/settings",
  "/api/warmup",
  "/api/auth/me", // Cache auth checks for faster loading
];

// Critical endpoints for immediate warmup on service worker install
const WARMUP_ENDPOINTS = ["/api/warmup", "/api/subjects", "/api/auth/me"];

// API endpoints that should trigger background sync
const SYNC_API_ROUTES = [
  "/api/subjects",
  "/api/tasks",
  "/api/attendance-history",
  "/api/user/profile",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[ServiceWorker] Install");

  event.waitUntil(
    Promise.all([
      // Cache static assets with error handling
      caches.open(STATIC_CACHE_NAME).then(async (cache) => {
        console.log("[ServiceWorker] Caching static assets");

        // Cache assets individually to handle failures gracefully
        const cachePromises = STATIC_ASSETS.map(async (asset) => {
          try {
            const response = await fetch(asset);
            if (response.ok) {
              await cache.put(asset, response);
              console.log(`[ServiceWorker] Cached: ${asset}`);
            } else {
              console.warn(
                `[ServiceWorker] Failed to cache ${asset}: ${response.status}`
              );
            }
          } catch (error) {
            console.warn(`[ServiceWorker] Error caching ${asset}:`, error);
          }
        });

        await Promise.allSettled(cachePromises);
      }),

      // Skip waiting to activate immediately
      self.skipWaiting(),
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[ServiceWorker] Activate");

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== CACHE_NAME &&
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== DYNAMIC_CACHE_NAME &&
              cacheName !== API_CACHE_NAME
            ) {
              console.log("[ServiceWorker] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),

      // Claim all clients
      self.clients.claim(),
    ])
  );
});

// Fetch event - handle all network requests
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Handle different types of requests
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(handleApiRequest(request));
  } else if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(handleStaticAssets(request));
  } else {
    event.respondWith(handlePageRequest(request));
  }
});

// Handle API requests with smart caching
async function handleApiRequest(request) {
  const url = new URL(request.url);
  const cache = await caches.open(API_CACHE_NAME);

  // For GET requests, try cache first
  if (request.method === "GET") {
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      const cacheTime = cachedResponse.headers.get("sw-cache-time");
      if (cacheTime) {
        const age = Date.now() - parseInt(cacheTime, 10);
        if (age < CACHE_DURATION.API) {
          console.log("[ServiceWorker] Serving from API cache:", url.pathname);

          // Update cache in background
          fetch(request)
            .then((response) => {
              if (response.ok) {
                const responseClone = response.clone();
                responseClone.headers.set(
                  "sw-cache-time",
                  Date.now().toString()
                );
                cache.put(request, responseClone);
              }
            })
            .catch(() => {
              // Ignore background update errors
            });

          return cachedResponse;
        }
      }
    }

    // Fetch from network
    try {
      const response = await fetch(request);

      if (
        response.ok &&
        CACHEABLE_API_ROUTES.some((route) => url.pathname.startsWith(route))
      ) {
        const responseClone = response.clone();
        responseClone.headers.set("sw-cache-time", Date.now().toString());
        cache.put(request, responseClone);
      }

      return response;
    } catch (error) {
      console.log(
        "[ServiceWorker] Network failed, serving from cache:",
        url.pathname
      );

      // Return cached version if available
      if (cachedResponse) {
        return cachedResponse;
      }

      // Return offline response
      return new Response(
        JSON.stringify({
          success: false,
          error: "Offline mode - data not available",
          offline: true,
        }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }

  // For POST/PUT/DELETE requests, try network first
  try {
    const response = await fetch(request);

    // If successful, trigger background sync for data consistency
    if (
      response.ok &&
      SYNC_API_ROUTES.some((route) => url.pathname.startsWith(route))
    ) {
      // Invalidate related cache entries
      await invalidateRelatedCache(url.pathname);
    }

    return response;
  } catch (error) {
    // For mutation requests, queue for background sync
    if (request.method !== "GET") {
      await queueBackgroundSync(request);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Request queued for when connection is restored",
          queued: true,
        }),
        {
          status: 202,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    throw error;
  }
}

// Handle static assets with long-term caching
async function handleStaticAssets(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log("[ServiceWorker] Failed to fetch static asset:", request.url);
    throw error;
  }
}

// Handle page requests with stale-while-revalidate
async function handlePageRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);

  // Always try to fetch from network first for pages
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log("[ServiceWorker] Network failed for page, serving from cache");

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page
    const offlineResponse = await cache.match("/offline");
    if (offlineResponse) {
      return offlineResponse;
    }

    // Fallback offline response
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Offline - SIAP UNDIP Schedule</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: system-ui; text-align: center; padding: 2rem; }
            .container { max-width: 400px; margin: 0 auto; }
            .icon { font-size: 4rem; margin-bottom: 1rem; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">📱</div>
            <h1>You're Offline</h1>
            <p>Please check your internet connection and try again.</p>
            <button onclick="window.location.reload()">Retry</button>
          </div>
        </body>
      </html>`,
      {
        status: 503,
        headers: { "Content-Type": "text/html" },
      }
    );
  }
}

// Background sync for queued requests
self.addEventListener("sync", (event) => {
  console.log("[ServiceWorker] Background sync:", event.tag);

  if (event.tag === "siap-undip-sync") {
    event.waitUntil(processQueuedRequests());
  }
});

// Invalidate related cache entries
async function invalidateRelatedCache(pathname) {
  const cache = await caches.open(API_CACHE_NAME);
  const keys = await cache.keys();

  const relatedKeys = keys.filter((key) => {
    const keyUrl = new URL(key.url);
    return keyUrl.pathname.startsWith(
      pathname.split("/").slice(0, 3).join("/")
    );
  });

  await Promise.all(relatedKeys.map((key) => cache.delete(key)));
}

// Queue requests for background sync
async function queueBackgroundSync(request) {
  try {
    // Store request data in IndexedDB for background sync
    const requestData = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: request.method !== "GET" ? await request.text() : null,
      timestamp: Date.now(),
    };

    // Use self.registration.sync if available
    if ("sync" in self.registration) {
      await self.registration.sync.register("siap-undip-sync");
    }

    console.log("[ServiceWorker] Request queued for background sync");
  } catch (error) {
    console.error("[ServiceWorker] Failed to queue request:", error);
  }
}

// Process queued requests when online
async function processQueuedRequests() {
  // This would typically retrieve queued requests from IndexedDB
  // and replay them when connection is restored
  console.log("[ServiceWorker] Processing queued requests...");

  // Implementation would depend on your specific queue storage mechanism
  // For now, we'll just log that the sync event was received
}

// Handle push notifications
self.addEventListener("push", (event) => {
  console.log("[ServiceWorker] Push received");

  const options = {
    body: event.data?.text() || "New notification from SIAP UNDIP Schedule",
    icon: "/icon-192x192.png",
    badge: "/icon-192x192.png",
    vibrate: [200, 100, 200],
    data: {
      url: "/",
    },
    actions: [
      {
        action: "open",
        title: "Open App",
      },
      {
        action: "close",
        title: "Close",
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification("SIAP UNDIP Schedule", options)
  );
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("[ServiceWorker] Notification click received");

  event.notification.close();

  if (event.action === "open" || !event.action) {
    event.waitUntil(
      self.clients.openWindow(event.notification.data?.url || "/")
    );
  }
});
