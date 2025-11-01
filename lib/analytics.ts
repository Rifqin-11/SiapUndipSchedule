// Performance monitoring and analytics system
// Tracks application performance, user interactions, and errors

export interface PerformanceMetrics {
  // Core Web Vitals
  FCP?: number; // First Contentful Paint
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte

  // Custom metrics
  timeToInteractive?: number;
  totalPageSize?: number;
  resourceLoadTime?: number;
  apiResponseTime?: number;
  cacheHitRate?: number;

  // Navigation metrics
  navigationStart?: number;
  domContentLoaded?: number;
  loadComplete?: number;
}

export interface UserInteractionEvent {
  type:
    | "click"
    | "scroll"
    | "navigation"
    | "form_submit"
    | "error"
    | "api_call";
  target?: string;
  timestamp: number;
  duration?: number;
  metadata?: Record<string, any>;
}

export interface ErrorEvent {
  type: "javascript" | "network" | "api" | "resource";
  message: string;
  stack?: string;
  url?: string;
  lineNumber?: number;
  columnNumber?: number;
  timestamp: number;
  userAgent?: string;
  userId?: string;
}

export interface AnalyticsConfig {
  enabled: boolean;
  endpoint?: string;
  apiKey?: string;
  userId?: string;
  sessionId: string;
  sampleRate: number; // 0-1, percentage of users to track
  trackErrors: boolean;
  trackPerformance: boolean;
  trackUserInteractions: boolean;
  batchSize: number;
  flushInterval: number; // milliseconds
}

class PerformanceMonitor {
  private config: AnalyticsConfig;
  private metrics: PerformanceMetrics = {};
  private events: UserInteractionEvent[] = [];
  private errors: ErrorEvent[] = [];
  private observer?: PerformanceObserver;
  private isTracking = false;
  private flushTimer?: NodeJS.Timeout;

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = {
      enabled: true,
      sessionId: this.generateSessionId(),
      sampleRate: 1.0, // Track 100% by default
      trackErrors: true,
      trackPerformance: true,
      trackUserInteractions: true,
      batchSize: 10,
      flushInterval: 30000, // 30 seconds
      ...config,
    };

    if (this.shouldTrack()) {
      this.initialize();
    }
  }

  /**
   * Initialize performance monitoring
   */
  private initialize(): void {
    if (typeof window === "undefined" || this.isTracking) return;

    this.isTracking = true;
    console.log("[Analytics] Performance monitoring initialized");

    // Track Core Web Vitals
    this.trackCoreWebVitals();

    // Track custom performance metrics
    this.trackCustomMetrics();

    // Track user interactions
    if (this.config.trackUserInteractions) {
      this.trackUserInteractions();
    }

    // Track errors
    if (this.config.trackErrors) {
      this.trackErrors();
    }

    // Start periodic flushing
    this.startPeriodicFlush();

    // Flush on page unload
    window.addEventListener("beforeunload", () => {
      this.flush();
    });
  }

  /**
   * Track Core Web Vitals using Performance Observer API
   */
  private trackCoreWebVitals(): void {
    if (!("PerformanceObserver" in window)) return;

    try {
      // Track LCP (Largest Contentful Paint)
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          this.metrics.LCP = lastEntry.startTime;
          this.recordEvent({
            type: "navigation",
            target: "LCP",
            timestamp: Date.now(),
            duration: lastEntry.startTime,
            metadata: { value: lastEntry.startTime },
          });
        }
      });
      this.observer.observe({ entryTypes: ["largest-contentful-paint"] });

      // Track FID (First Input Delay)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.metrics.FID = entry.processingStart - entry.startTime;
          this.recordEvent({
            type: "navigation",
            target: "FID",
            timestamp: Date.now(),
            duration: entry.processingStart - entry.startTime,
            metadata: { value: entry.processingStart - entry.startTime },
          });
        });
      }).observe({ entryTypes: ["first-input"] });

      // Track CLS (Cumulative Layout Shift)
      let clsValue = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        this.metrics.CLS = clsValue;
      }).observe({ entryTypes: ["layout-shift"] });
    } catch (error) {
      console.warn(
        "[Analytics] Failed to setup Core Web Vitals tracking:",
        error
      );
    }
  }

  /**
   * Track custom performance metrics
   */
  private trackCustomMetrics(): void {
    // Track navigation timing
    window.addEventListener("load", () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType(
          "navigation"
        )[0] as PerformanceNavigationTiming;

        if (navigation) {
          this.metrics.TTFB =
            navigation.responseStart - navigation.requestStart;
          this.metrics.FCP =
            navigation.domContentLoadedEventEnd - navigation.startTime;
          this.metrics.domContentLoaded =
            navigation.domContentLoadedEventEnd - navigation.startTime;
          this.metrics.loadComplete =
            navigation.loadEventEnd - navigation.startTime;

          this.recordEvent({
            type: "navigation",
            target: "page_load",
            timestamp: Date.now(),
            duration: this.metrics.loadComplete,
            metadata: {
              TTFB: this.metrics.TTFB,
              FCP: this.metrics.FCP,
              domContentLoaded: this.metrics.domContentLoaded,
              loadComplete: this.metrics.loadComplete,
            },
          });
        }
      }, 0);
    });

    // Track resource loading times
    this.trackResourcePerformance();

    // Track API response times
    this.trackApiPerformance();
  }

  /**
   * Track resource loading performance
   */
  private trackResourcePerformance(): void {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();

      entries.forEach((entry) => {
        if (entry.entryType === "resource") {
          const resourceEntry = entry as PerformanceResourceTiming;

          this.recordEvent({
            type: "navigation",
            target: "resource_load",
            timestamp: Date.now(),
            duration: resourceEntry.duration,
            metadata: {
              name: resourceEntry.name,
              size: resourceEntry.transferSize,
              type: this.getResourceType(resourceEntry.name),
              cached: resourceEntry.transferSize === 0,
            },
          });
        }
      });
    });

    observer.observe({ entryTypes: ["resource"] });
  }

  /**
   * Track API response times by intercepting fetch
   */
  private trackApiPerformance(): void {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const startTime = performance.now();
      const request = args[0];
      const url =
        typeof request === "string"
          ? request
          : request instanceof URL
          ? request.href
          : (request as Request).url;

      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;

        // Only track API calls (not external resources)
        if (url.includes("/api/")) {
          this.recordEvent({
            type: "api_call",
            target: url,
            timestamp: Date.now(),
            duration,
            metadata: {
              status: response.status,
              success: response.ok,
              method: args[1]?.method || "GET",
            },
          });

          // Update average API response time
          this.metrics.apiResponseTime = this.metrics.apiResponseTime
            ? (this.metrics.apiResponseTime + duration) / 2
            : duration;
        }

        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;

        this.recordError({
          type: "network",
          message: `API call failed: ${url}`,
          url,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          userId: this.config.userId,
        });

        throw error;
      }
    };
  }

  /**
   * Track user interactions
   */
  private trackUserInteractions(): void {
    // Track clicks
    document.addEventListener("click", (event) => {
      const target = this.getElementSelector(event.target as Element);
      this.recordEvent({
        type: "click",
        target,
        timestamp: Date.now(),
        metadata: {
          x: event.clientX,
          y: event.clientY,
          button: event.button,
        },
      });
    });

    // Track form submissions
    document.addEventListener("submit", (event) => {
      const target = this.getElementSelector(event.target as Element);
      this.recordEvent({
        type: "form_submit",
        target,
        timestamp: Date.now(),
      });
    });

    // Track scroll depth
    let maxScrollDepth = 0;
    let scrollTimer: NodeJS.Timeout;

    window.addEventListener("scroll", () => {
      const scrollDepth = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) *
          100
      );

      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;

        // Debounce scroll tracking
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
          this.recordEvent({
            type: "scroll",
            target: "page",
            timestamp: Date.now(),
            metadata: { scrollDepth: maxScrollDepth },
          });
        }, 1000);
      }
    });
  }

  /**
   * Track JavaScript and network errors
   */
  private trackErrors(): void {
    // Track JavaScript errors
    window.addEventListener("error", (event) => {
      this.recordError({
        type: "javascript",
        message: event.message,
        url: event.filename,
        lineNumber: event.lineno,
        columnNumber: event.colno,
        stack: event.error?.stack,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        userId: this.config.userId,
      });
    });

    // Track unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      this.recordError({
        type: "javascript",
        message: `Unhandled promise rejection: ${event.reason}`,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        userId: this.config.userId,
      });
    });
  }

  /**
   * Record a user interaction event
   */
  private recordEvent(event: UserInteractionEvent): void {
    if (!this.config.enabled) return;

    this.events.push(event);

    // Flush if batch size reached
    if (this.events.length >= this.config.batchSize) {
      this.flush();
    }
  }

  /**
   * Record an error event
   */
  private recordError(error: ErrorEvent): void {
    if (!this.config.enabled || !this.config.trackErrors) return;

    this.errors.push(error);
    console.error("[Analytics] Error recorded:", error);

    // Flush errors immediately for critical issues
    if (this.errors.length >= 5) {
      this.flush();
    }
  }

  /**
   * Start periodic flushing of analytics data
   */
  private startPeriodicFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  /**
   * Flush analytics data to endpoint
   */
  private async flush(): Promise<void> {
    if (!this.config.enabled || (!this.events.length && !this.errors.length)) {
      return;
    }

    const payload = {
      sessionId: this.config.sessionId,
      userId: this.config.userId,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      metrics: this.metrics,
      events: [...this.events],
      errors: [...this.errors],
    };

    // Clear local data
    this.events = [];
    this.errors = [];

    try {
      if (this.config.endpoint) {
        // Send to custom analytics endpoint
        await fetch(this.config.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(this.config.apiKey && {
              Authorization: `Bearer ${this.config.apiKey}`,
            }),
          },
          body: JSON.stringify(payload),
        });
      } else {
        // Log to console in development
        console.log("[Analytics] Performance data:", payload);
      }
    } catch (error) {
      console.warn("[Analytics] Failed to send analytics data:", error);

      // Re-add events back to queue for retry
      this.events.unshift(...payload.events);
      this.errors.unshift(...payload.errors);
    }
  }

  /**
   * Utility methods
   */
  private shouldTrack(): boolean {
    return this.config.enabled && Math.random() < this.config.sampleRate;
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getElementSelector(element: Element): string {
    if (!element) return "unknown";

    const id = element.id ? `#${element.id}` : "";
    const className = element.className
      ? `.${element.className.split(" ").join(".")}`
      : "";
    const tagName = element.tagName.toLowerCase();

    return `${tagName}${id}${className}` || "unknown";
  }

  private getResourceType(url: string): string {
    if (url.includes(".js")) return "script";
    if (url.includes(".css")) return "stylesheet";
    if (url.match(/\.(png|jpg|jpeg|gif|webp|svg)$/)) return "image";
    if (url.includes("/api/")) return "api";
    return "other";
  }

  /**
   * Public methods
   */
  public setUserId(userId: string): void {
    this.config.userId = userId;
  }

  public setConfig(config: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public trackCustomEvent(
    event: Omit<UserInteractionEvent, "timestamp">
  ): void {
    this.recordEvent({
      ...event,
      timestamp: Date.now(),
    });
  }

  public stop(): void {
    this.isTracking = false;
    this.observer?.disconnect();

    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flush(); // Final flush
  }
}

// Global analytics instance
let analyticsInstance: PerformanceMonitor | null = null;

/**
 * Initialize performance monitoring
 */
export function initializeAnalytics(
  config?: Partial<AnalyticsConfig>
): PerformanceMonitor {
  if (!analyticsInstance) {
    analyticsInstance = new PerformanceMonitor(config);
  }
  return analyticsInstance;
}

/**
 * Get current analytics instance
 */
export function getAnalytics(): PerformanceMonitor | null {
  return analyticsInstance;
}

/**
 * Track custom event
 */
export function trackEvent(
  event: Omit<UserInteractionEvent, "timestamp">
): void {
  analyticsInstance?.trackCustomEvent(event);
}

/**
 * Get current performance metrics
 */
export function getPerformanceMetrics(): PerformanceMetrics | null {
  return analyticsInstance?.getMetrics() || null;
}

/**
 * Set user ID for analytics
 */
export function setAnalyticsUserId(userId: string): void {
  analyticsInstance?.setUserId(userId);
}
