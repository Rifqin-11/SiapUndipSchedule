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

// Add cache busting headers to fetch requests
export const createCacheBustingHeaders = () => ({
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
  "X-Requested-With": "XMLHttpRequest",
  "X-Cache-Buster": generateCacheBuster(),
  "X-Timestamp": Date.now().toString(),
});

// Fetch with aggressive cache busting
export const fetchWithCacheBusting = async (
  url: string,
  options: RequestInit = {}
) => {
  const cacheBustingUrl = url.includes("?")
    ? `${url}&_cb=${generateCacheBuster()}`
    : `${url}?_cb=${generateCacheBuster()}`;

  return fetch(cacheBustingUrl, {
    ...options,
    cache: "no-store",
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
