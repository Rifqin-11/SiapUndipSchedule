"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { initializePrefetchManager, getPrefetchManager } from "@/lib/prefetch";

export function usePrefetch() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Initialize prefetch manager when component mounts
    if (typeof window !== "undefined") {
      const manager = initializePrefetchManager(queryClient);
      console.log("✅ Advanced prefetching initialized");

      // Optional: Add custom prefetch rules based on your app's specific needs
      // manager.addRule({
      //   route: '/custom-route',
      //   prefetchTargets: [...],
      //   conditions: {...}
      // });
    }
  }, [queryClient]);

  return {
    // Utility functions
    enablePrefetching: (enabled: boolean) => {
      getPrefetchManager()?.setEnabled(enabled);
    },

    getBehaviorAnalytics: () => {
      return getPrefetchManager()?.getBehaviorAnalytics();
    },

    clearBehaviorData: () => {
      getPrefetchManager()?.clearBehaviorData();
    },
  };
}
