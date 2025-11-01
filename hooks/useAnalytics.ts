"use client";

import { useEffect } from "react";
import {
  initializeAnalytics,
  setAnalyticsUserId,
  trackEvent,
} from "@/lib/analytics";
import { useAuth } from "./useAuth";

export function useAnalytics() {
  const { user } = useAuth();

  useEffect(() => {
    // Initialize analytics when component mounts
    if (typeof window !== "undefined") {
      const analytics = initializeAnalytics({
        enabled: process.env.NODE_ENV === "production", // Only in production
        trackErrors: true,
        trackPerformance: true,
        trackUserInteractions: true,
        sampleRate: 0.1, // Track 10% of users to avoid overwhelming
        batchSize: 5,
        flushInterval: 30000, // 30 seconds
      });

      console.log("✅ Performance monitoring and analytics initialized");
    }
  }, []);

  // Set user ID when user is authenticated
  useEffect(() => {
    if (user) {
      setAnalyticsUserId(user.id);
    }
  }, [user]);

  return {
    // Utility function to track custom events
    trackCustomEvent: (event: {
      type:
        | "click"
        | "scroll"
        | "navigation"
        | "form_submit"
        | "error"
        | "api_call";
      target?: string;
      duration?: number;
      metadata?: Record<string, any>;
    }) => {
      trackEvent(event);
    },
  };
}
