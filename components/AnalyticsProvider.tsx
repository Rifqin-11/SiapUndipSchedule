"use client";

import { useAnalytics } from "@/hooks/useAnalytics";

export default function AnalyticsProvider() {
  // Initialize analytics and performance monitoring
  useAnalytics();

  // This component doesn't render anything - it just initializes analytics
  return null;
}
