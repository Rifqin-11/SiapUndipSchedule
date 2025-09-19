"use client";

import { useEffect, useState } from "react";
import { initializeServiceWorker } from "@/lib/service-worker";

interface ServiceWorkerStatus {
  isSupported: boolean;
  isRegistered: boolean;
  isActive: boolean;
  registration: ServiceWorkerRegistration | null;
}

export default function ServiceWorkerInitializer() {
  const [swStatus, setSwStatus] = useState<ServiceWorkerStatus>({
    isSupported: false,
    isRegistered: false,
    isActive: false,
    registration: null,
  });

  useEffect(() => {
    // Initialize service worker when component mounts
    const initSW = async () => {
      try {
        const status = await initializeServiceWorker();
        setSwStatus(status);

        if (status.isRegistered) {
          console.log("✅ Service Worker initialized successfully");
        }
      } catch (error) {
        console.error("❌ Service Worker initialization failed:", error);
      }
    };

    // Only initialize on client side
    if (typeof window !== "undefined") {
      initSW();
    }
  }, []);

  // Don't render anything - this is just for initialization
  return null;
}
