/**
 * Cache Busting Utilities
 * Untuk mengatasi masalah browser cache yang mengganggu real-time updates
 */

// Generate unique cache buster
export const generateCacheBuster = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Clear browser cache programmatically (untuk development)
export const clearBrowserCache = async (): Promise<boolean> => {
  try {
    // Clear service worker cache jika ada
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
    }

    // Clear localStorage
    localStorage.clear();

    // Clear sessionStorage
    sessionStorage.clear();

    // Clear cookies terkait app (opsional, hati-hati dengan auth)
    // document.cookie.split(";").forEach(function(c) {
    //   document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    // });

    return true;
  } catch (error) {
    console.error("Failed to clear browser cache:", error);
    return false;
  }
};

// Force reload page dengan cache bypass
export const forceReload = (): void => {
  // Hard reload dengan cache bypass
  window.location.reload();
};

// Add cache busting headers to fetch requests (optimized for performance)
export const createCacheBustingHeaders = () => ({
  "Cache-Control": "max-age=30", // Allow 30 seconds of caching for performance
});

// Fetch with optimized caching (not aggressive cache busting)
export const fetchWithCacheBusting = async (
  url: string,
  options: RequestInit = {}
) => {
  // Only add cache buster for mutations, not for read operations
  const shouldCacheBust = options.method && options.method !== "GET";
  const finalUrl = shouldCacheBust 
    ? (url.includes("?") ? `${url}&_cb=${generateCacheBuster()}` : `${url}?_cb=${generateCacheBuster()}`)
    : url;

  return fetch(finalUrl, {
    ...options,
    cache: shouldCacheBust ? "no-store" : "default", // Allow browser caching for GET requests
    headers: {
      ...createCacheBustingHeaders(),
      ...options.headers,
    },
  });
};

// Custom hook untuk force refresh data
export const useForceRefresh = () => {
  const forceRefresh = () => {
    // Trigger custom event untuk memaksa refresh semua queries
    window.dispatchEvent(new CustomEvent("force-cache-refresh"));
  };

  return { forceRefresh };
};

export default {
  generateCacheBuster,
  clearBrowserCache,
  forceReload,
  createCacheBustingHeaders,
  fetchWithCacheBusting,
  useForceRefresh,
};
