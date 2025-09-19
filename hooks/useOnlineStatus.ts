import { useState, useEffect } from "react";

interface OnlineStatus {
  isOnline: boolean;
  isOffline: boolean;
  lastOnlineAt?: Date;
  lastOfflineAt?: Date;
  connectionType?: string;
  effectiveType?: string;
}

/**
 * Hook untuk mendeteksi status online/offline
 * Menggunakan navigator.onLine dan Network Information API
 */
export function useOnlineStatus(): OnlineStatus {
  const [status, setStatus] = useState<OnlineStatus>(() => ({
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    isOffline: typeof navigator !== "undefined" ? !navigator.onLine : false,
  }));

  useEffect(() => {
    // Update status berdasarkan navigator.onLine
    const updateOnlineStatus = () => {
      const isOnline = navigator.onLine;
      const now = new Date();

      setStatus((prev) => ({
        ...prev,
        isOnline,
        isOffline: !isOnline,
        ...(isOnline ? { lastOnlineAt: now } : { lastOfflineAt: now }),
      }));

      // Log status change
      console.log(
        `[OnlineStatus] ${
          isOnline ? "Online" : "Offline"
        } at ${now.toISOString()}`
      );

      // Dispatch custom event untuk komponen lain
      window.dispatchEvent(
        new CustomEvent("online-status-change", {
          detail: { isOnline, timestamp: now },
        })
      );
    };

    // Update network information jika tersedia
    const updateNetworkInfo = () => {
      if ("connection" in navigator) {
        const connection = (navigator as any).connection;
        setStatus((prev) => ({
          ...prev,
          connectionType: connection?.type || "unknown",
          effectiveType: connection?.effectiveType || "unknown",
        }));
      }
    };

    // Initial network info update
    updateNetworkInfo();

    // Event listeners untuk online/offline
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    // Event listener untuk network change (jika tersedia)
    if ("connection" in navigator) {
      const connection = (navigator as any).connection;
      connection?.addEventListener("change", updateNetworkInfo);
    }

    // Cleanup
    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);

      if ("connection" in navigator) {
        const connection = (navigator as any).connection;
        connection?.removeEventListener("change", updateNetworkInfo);
      }
    };
  }, []);

  return status;
}

/**
 * Hook untuk mendeteksi apakah sedang offline
 * Versi simplified dari useOnlineStatus
 */
export function useIsOffline(): boolean {
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== "undefined" ? !navigator.onLine : false
  );

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOffline;
}

/**
 * Hook untuk retry mechanism saat kembali online
 */
export function useRetryOnOnline(retryFunction: () => void | Promise<void>) {
  const { isOnline } = useOnlineStatus();
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline && isOnline) {
      // Kembali online setelah offline, jalankan retry
      console.log("[RetryOnOnline] Retrying after coming back online");
      retryFunction();
      setWasOffline(false);
    }
  }, [isOnline, wasOffline, retryFunction]);
}
