// Service Worker registration and management utilities

let swRegistration: ServiceWorkerRegistration | null = null;

interface ServiceWorkerStatus {
  isSupported: boolean;
  isRegistered: boolean;
  isActive: boolean;
  registration: ServiceWorkerRegistration | null;
}

/**
 * Register the service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerStatus> {
  const status: ServiceWorkerStatus = {
    isSupported: false,
    isRegistered: false,
    isActive: false,
    registration: null,
  };

  // Check if service workers are supported
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    status.isSupported = true;

    try {
      // Register the service worker
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "imports",
      });

      swRegistration = registration;
      status.isRegistered = true;
      status.registration = registration;

      console.log("[ServiceWorker] Registration successful:", registration);

      // Check if service worker is active
      if (registration.active) {
        status.isActive = true;
        console.log("[ServiceWorker] Service worker is active");
      }

      // Listen for updates
      registration.addEventListener("updatefound", () => {
        console.log("[ServiceWorker] Update found");
        const newWorker = registration.installing;

        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              console.log("[ServiceWorker] New content is available");

              // Notify user about update
              if (typeof window !== "undefined" && window.dispatchEvent) {
                window.dispatchEvent(new CustomEvent("sw-update-available"));
              }
            }
          });
        }
      });

      // Listen for controlling service worker changes
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        console.log("[ServiceWorker] Controller changed");

        // Reload page when new service worker takes control
        if (typeof window !== "undefined") {
          window.location.reload();
        }
      });

      // Check for updates periodically
      setInterval(() => {
        registration.update();
      }, 60000); // Check every minute
    } catch (error) {
      console.error("[ServiceWorker] Registration failed:", error);
    }
  } else {
    console.log("[ServiceWorker] Service workers are not supported");
  }

  return status;
}

/**
 * Unregister the service worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (swRegistration) {
    try {
      const result = await swRegistration.unregister();
      console.log("[ServiceWorker] Unregistration successful");
      swRegistration = null;
      return result;
    } catch (error) {
      console.error("[ServiceWorker] Unregistration failed:", error);
      return false;
    }
  }
  return false;
}

/**
 * Update the service worker
 */
export async function updateServiceWorker(): Promise<void> {
  if (swRegistration) {
    try {
      await swRegistration.update();
      console.log("[ServiceWorker] Update check completed");
    } catch (error) {
      console.error("[ServiceWorker] Update check failed:", error);
    }
  }
}

/**
 * Skip waiting for new service worker
 */
export async function skipWaiting(): Promise<void> {
  if (swRegistration && swRegistration.waiting) {
    swRegistration.waiting.postMessage({ type: "SKIP_WAITING" });
  }
}

/**
 * Get current service worker status
 */
export function getServiceWorkerStatus(): ServiceWorkerStatus {
  return {
    isSupported: typeof window !== "undefined" && "serviceWorker" in navigator,
    isRegistered: swRegistration !== null,
    isActive: swRegistration?.active !== null,
    registration: swRegistration,
  };
}

/**
 * Request notification permission for push notifications
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window !== "undefined" && "Notification" in window) {
    const permission = await Notification.requestPermission();
    console.log("[ServiceWorker] Notification permission:", permission);
    return permission;
  }
  return "denied";
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  if (swRegistration) {
    try {
      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      console.log("[ServiceWorker] Push subscription successful");
      return subscription;
    } catch (error) {
      console.error("[ServiceWorker] Push subscription failed:", error);
      return null;
    }
  }
  return null;
}

/**
 * Get existing push subscription
 */
export async function getPushSubscription(): Promise<PushSubscription | null> {
  if (swRegistration) {
    try {
      return await swRegistration.pushManager.getSubscription();
    } catch (error) {
      console.error("[ServiceWorker] Failed to get push subscription:", error);
      return null;
    }
  }
  return null;
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  const subscription = await getPushSubscription();
  if (subscription) {
    try {
      const result = await subscription.unsubscribe();
      console.log("[ServiceWorker] Push unsubscription successful");
      return result;
    } catch (error) {
      console.error("[ServiceWorker] Push unsubscription failed:", error);
      return false;
    }
  }
  return false;
}

/**
 * Send message to service worker
 */
export function sendMessageToServiceWorker(message: any): void {
  if (swRegistration && swRegistration.active) {
    swRegistration.active.postMessage(message);
  }
}

/**
 * Clear all caches
 */
export async function clearAllCaches(): Promise<void> {
  if (typeof window !== "undefined" && "caches" in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
      console.log("[ServiceWorker] All caches cleared");
    } catch (error) {
      console.error("[ServiceWorker] Failed to clear caches:", error);
    }
  }
}

/**
 * Get cache storage usage
 */
export async function getCacheStorageUsage(): Promise<{
  usage: number;
  quota: number;
} | null> {
  if (
    typeof window !== "undefined" &&
    "navigator" in window &&
    "storage" in navigator &&
    "estimate" in navigator.storage
  ) {
    try {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
      };
    } catch (error) {
      console.error("[ServiceWorker] Failed to get storage estimate:", error);
      return null;
    }
  }
  return null;
}

/**
 * Initialize service worker and related features
 */
export async function initializeServiceWorker(): Promise<ServiceWorkerStatus> {
  // Only run on client side
  if (typeof window === "undefined") {
    return {
      isSupported: false,
      isRegistered: false,
      isActive: false,
      registration: null,
    };
  }

  // Register service worker
  const status = await registerServiceWorker();

  // Set up update notifications
  window.addEventListener("sw-update-available", () => {
    // You can show a notification to user about available update
    console.log(
      "[ServiceWorker] Update available - you can notify the user here"
    );
  });

  // Request notification permission if supported
  if (status.isSupported) {
    await requestNotificationPermission();
  }

  return status;
}
