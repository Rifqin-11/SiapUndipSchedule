import React from "react";

// Performance monitoring utilities
interface PerformanceMetrics {
  name: string;
  duration: number;
  timestamp: number;
  type: "navigation" | "resource" | "measure" | "mark";
  details?: Record<string, any>;
}

interface UserInteraction {
  type: "click" | "scroll" | "input" | "error";
  element?: string;
  timestamp: number;
  data?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private interactions: UserInteraction[] = [];
  private observer: PerformanceObserver | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.initializeObserver();
      this.trackCoreWebVitals();
    }
  }

  private initializeObserver() {
    if ("PerformanceObserver" in window) {
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.addMetric({
            name: entry.name,
            duration: entry.duration,
            timestamp: entry.startTime,
            type: entry.entryType as any,
            details: {
              startTime: entry.startTime,
              transferSize: (entry as any).transferSize,
              decodedBodySize: (entry as any).decodedBodySize,
            },
          });
        });
      });

      // Observe different types of performance entries
      try {
        this.observer.observe({
          entryTypes: ["navigation", "resource", "measure", "mark"],
        });
      } catch (e) {
        console.warn("Performance Observer not fully supported");
      }
    }
  }

  private trackCoreWebVitals() {
    // Track Largest Contentful Paint (LCP)
    if ("PerformanceObserver" in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];

        this.addMetric({
          name: "LCP",
          duration: lastEntry.startTime,
          timestamp: Date.now(),
          type: "measure",
          details: {
            value: lastEntry.startTime,
            rating:
              lastEntry.startTime > 4000
                ? "poor"
                : lastEntry.startTime > 2500
                ? "needs-improvement"
                : "good",
          },
        });
      });

      try {
        lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
      } catch (e) {
        console.warn("LCP tracking not supported");
      }
    }

    // Track First Input Delay (FID)
    if ("PerformanceObserver" in window) {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const fidEntry = entry as any; // Type assertion for FID entry
          this.addMetric({
            name: "FID",
            duration: fidEntry.processingStart - fidEntry.startTime,
            timestamp: Date.now(),
            type: "measure",
            details: {
              value: fidEntry.processingStart - fidEntry.startTime,
              rating:
                fidEntry.processingStart - fidEntry.startTime > 300
                  ? "poor"
                  : fidEntry.processingStart - fidEntry.startTime > 100
                  ? "needs-improvement"
                  : "good",
            },
          });
        });
      });

      try {
        fidObserver.observe({ entryTypes: ["first-input"] });
      } catch (e) {
        console.warn("FID tracking not supported");
      }
    }
  }

  addMetric(metric: PerformanceMetrics) {
    this.metrics.push(metric);

    // Keep only last 100 metrics to prevent memory issues
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }

    // Log important metrics in development
    if (process.env.NODE_ENV === "development") {
      console.log("Performance Metric:", metric);
    }
  }

  trackUserInteraction(interaction: UserInteraction) {
    this.interactions.push({
      ...interaction,
      timestamp: Date.now(),
    });

    // Keep only last 50 interactions
    if (this.interactions.length > 50) {
      this.interactions = this.interactions.slice(-50);
    }
  }

  markStart(name: string) {
    if (typeof window !== "undefined" && "performance" in window) {
      performance.mark(`${name}-start`);
    }
  }

  markEnd(name: string) {
    if (typeof window !== "undefined" && "performance" in window) {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
    }
  }

  getMetrics() {
    return [...this.metrics];
  }

  getInteractions() {
    return [...this.interactions];
  }

  getWebVitals() {
    return this.metrics.filter((metric) =>
      ["LCP", "FID", "CLS"].includes(metric.name)
    );
  }

  // Get performance summary
  getSummary() {
    const webVitals = this.getWebVitals();
    const resourceMetrics = this.metrics.filter((m) => m.type === "resource");
    const navigationMetrics = this.metrics.filter(
      (m) => m.type === "navigation"
    );

    return {
      webVitals: webVitals.reduce((acc, vital) => {
        acc[vital.name] = vital.details;
        return acc;
      }, {} as Record<string, any>),

      resourceCount: resourceMetrics.length,
      averageResourceLoadTime:
        resourceMetrics.length > 0
          ? resourceMetrics.reduce((sum, m) => sum + m.duration, 0) /
            resourceMetrics.length
          : 0,

      navigationCount: navigationMetrics.length,
      totalInteractions: this.interactions.length,

      slowResources: resourceMetrics
        .filter((m) => m.duration > 1000)
        .map((m) => ({ name: m.name, duration: m.duration })),
    };
  }

  // Send metrics to analytics service (implement based on your needs)
  async sendMetrics() {
    const summary = this.getSummary();

    // Example: Send to your analytics endpoint
    try {
      if (process.env.NODE_ENV === "production") {
        await fetch("/api/analytics/performance", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(summary),
        });
      }
    } catch (error) {
      console.warn("Failed to send performance metrics:", error);
    }
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export function usePerformanceMonitoring() {
  const trackComponentMount = (componentName: string) => {
    performanceMonitor.markStart(`component-${componentName}`);

    return () => {
      performanceMonitor.markEnd(`component-${componentName}`);
    };
  };

  const trackUserAction = (action: string, details?: Record<string, any>) => {
    performanceMonitor.trackUserInteraction({
      type: "click",
      element: action,
      timestamp: Date.now(),
      data: details,
    });
  };

  const trackError = (error: Error, context?: string) => {
    performanceMonitor.trackUserInteraction({
      type: "error",
      element: context || "unknown",
      timestamp: Date.now(),
      data: {
        message: error.message,
        stack: error.stack,
      },
    });
  };

  return {
    trackComponentMount,
    trackUserAction,
    trackError,
    getMetrics: () => performanceMonitor.getMetrics(),
    getSummary: () => performanceMonitor.getSummary(),
  };
}

// HOC for automatic component performance tracking
export function withPerformanceTracking<P extends {}>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  return function PerformanceTrackedComponent(props: P) {
    const name = componentName || Component.displayName || Component.name;

    React.useEffect(() => {
      performanceMonitor.markStart(`component-${name}`);
      return () => {
        performanceMonitor.markEnd(`component-${name}`);
      };
    }, [name]);

    return React.createElement(Component, props);
  };
}
