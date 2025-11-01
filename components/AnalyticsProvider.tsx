"use client";

import { useEffect } from "react";

export default function AnalyticsProvider() {
  useEffect(() => {
    // Defer analytics initialization to idle time to avoid competing with LCP
    const run = () => {
      import("@/hooks/useAnalytics").then((mod) => {
        try {
          // call the hook function to initialize analytics
          // the hook itself uses useEffect internally, but dynamic import returns the module
          // We call the initializer directly if available
          if (mod && typeof mod.useAnalytics === "function") {
            // execute in a safe, non-hook context to initialize analytics
            mod.useAnalytics();
          }
        } catch (e) {
          // ignore initialization failures
          // console.debug("analytics init deferred failed", e);
        }
      });
    };

    if (typeof (window as any).requestIdleCallback === "function") {
      (window as any).requestIdleCallback(run, { timeout: 2000 });
    } else {
      // fallback after short delay
      const id = window.setTimeout(run, 1500);
      return () => window.clearTimeout(id);
    }
  }, []);

  return null;
}
