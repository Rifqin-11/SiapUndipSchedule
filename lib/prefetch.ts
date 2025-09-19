// Advanced prefetching system for predictive data loading
// Analyzes user behavior and preloads data for better performance

import { QueryClient } from "@tanstack/react-query";

export interface PrefetchConfig {
  enabled: boolean;
  priority: "low" | "medium" | "high";
  maxAge: number; // milliseconds
  conditions?: string[]; // conditions under which to prefetch
}

export interface UserBehaviorData {
  mostVisitedRoutes: string[];
  timeSpentOnRoutes: Record<string, number>;
  navigationPatterns: Array<{ from: string; to: string; count: number }>;
  timeOfDayPreferences: Record<string, number[]>;
  lastVisitTimes: Record<string, number>;
}

export interface PrefetchRule {
  route: string;
  prefetchTargets: Array<{
    queryKey: string[];
    queryFn: () => Promise<any>;
    config: PrefetchConfig;
  }>;
  conditions?: {
    timeOfDay?: number[];
    dayOfWeek?: number[];
    userBehavior?: (behavior: UserBehaviorData) => boolean;
  };
}

class PrefetchManager {
  private queryClient: QueryClient;
  private userBehavior: UserBehaviorData;
  private prefetchRules: PrefetchRule[] = [];
  private isEnabled = true;
  private currentRoute = "";
  private routeStartTime = Date.now();

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
    this.userBehavior = this.loadUserBehavior();
    this.setupDefaultRules();
    this.startBehaviorTracking();
  }

  /**
   * Setup default prefetch rules based on common navigation patterns
   */
  private setupDefaultRules(): void {
    this.prefetchRules = [
      // Homepage to schedule prefetching
      {
        route: "/",
        prefetchTargets: [
          {
            queryKey: ["subjects"],
            queryFn: () => fetch("/api/subjects").then((res) => res.json()),
            config: { enabled: true, priority: "high", maxAge: 5 * 60 * 1000 },
          },
          {
            queryKey: ["tasks"],
            queryFn: () => fetch("/api/tasks").then((res) => res.json()),
            config: {
              enabled: true,
              priority: "medium",
              maxAge: 2 * 60 * 1000,
            },
          },
        ],
        conditions: {
          timeOfDay: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], // School hours
        },
      },

      // Schedule to task prefetching
      {
        route: "/schedule",
        prefetchTargets: [
          {
            queryKey: ["tasks"],
            queryFn: () => fetch("/api/tasks").then((res) => res.json()),
            config: {
              enabled: true,
              priority: "medium",
              maxAge: 2 * 60 * 1000,
            },
          },
          {
            queryKey: ["attendance-status"],
            queryFn: () =>
              fetch("/api/attendance-status").then((res) => res.json()),
            config: { enabled: true, priority: "low", maxAge: 1 * 60 * 1000 },
          },
        ],
      },

      // Tasks to subjects prefetching
      {
        route: "/tasks",
        prefetchTargets: [
          {
            queryKey: ["subjects"],
            queryFn: () => fetch("/api/subjects").then((res) => res.json()),
            config: {
              enabled: true,
              priority: "medium",
              maxAge: 5 * 60 * 1000,
            },
          },
        ],
      },

      // Settings to profile/attendance prefetching
      {
        route: "/settings",
        prefetchTargets: [
          {
            queryKey: ["user-profile"],
            queryFn: () => fetch("/api/user/profile").then((res) => res.json()),
            config: {
              enabled: true,
              priority: "medium",
              maxAge: 10 * 60 * 1000,
            },
          },
          {
            queryKey: ["attendance-history"],
            queryFn: () =>
              fetch("/api/attendance-history").then((res) => res.json()),
            config: { enabled: true, priority: "low", maxAge: 5 * 60 * 1000 },
          },
        ],
      },

      // User page prefetching
      {
        route: "/user",
        prefetchTargets: [
          {
            queryKey: ["user-profile"],
            queryFn: () => fetch("/api/user/profile").then((res) => res.json()),
            config: { enabled: true, priority: "high", maxAge: 10 * 60 * 1000 },
          },
          {
            queryKey: ["subjects"], // For attendance stats
            queryFn: () => fetch("/api/subjects").then((res) => res.json()),
            config: {
              enabled: true,
              priority: "medium",
              maxAge: 5 * 60 * 1000,
            },
          },
        ],
      },
    ];
  }

  /**
   * Track user behavior for intelligent prefetching
   */
  private startBehaviorTracking(): void {
    if (typeof window === "undefined") return;

    // Track route changes
    const handleRouteChange = () => {
      const newRoute = window.location.pathname;
      if (newRoute !== this.currentRoute) {
        this.recordNavigation(this.currentRoute, newRoute);
        this.currentRoute = newRoute;
        this.routeStartTime = Date.now();

        // Trigger prefetching for new route
        this.prefetchForRoute(newRoute);
      }
    };

    // Listen for navigation events
    window.addEventListener("popstate", handleRouteChange);

    // Track initial route
    this.currentRoute = window.location.pathname;
    this.prefetchForRoute(this.currentRoute);

    // Track time spent on routes
    const trackTimeSpent = () => {
      if (this.currentRoute) {
        const timeSpent = Date.now() - this.routeStartTime;
        this.userBehavior.timeSpentOnRoutes[this.currentRoute] =
          (this.userBehavior.timeSpentOnRoutes[this.currentRoute] || 0) +
          timeSpent;
        this.saveUserBehavior();
      }
    };

    // Track time when user leaves the page
    window.addEventListener("beforeunload", trackTimeSpent);
    window.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        trackTimeSpent();
      } else {
        this.routeStartTime = Date.now();
      }
    });

    // Periodic behavior analysis and prefetching
    setInterval(() => {
      this.analyzeBehaviorAndPrefetch();
    }, 30000); // Every 30 seconds
  }

  /**
   * Record navigation pattern
   */
  private recordNavigation(from: string, to: string): void {
    if (!from || !to || from === to) return;

    // Update most visited routes
    if (!this.userBehavior.mostVisitedRoutes.includes(to)) {
      this.userBehavior.mostVisitedRoutes.push(to);
    }

    // Update navigation patterns
    const pattern = this.userBehavior.navigationPatterns.find(
      (p) => p.from === from && p.to === to
    );
    if (pattern) {
      pattern.count++;
    } else {
      this.userBehavior.navigationPatterns.push({ from, to, count: 1 });
    }

    // Update last visit time
    this.userBehavior.lastVisitTimes[to] = Date.now();

    // Update time of day preferences
    const hour = new Date().getHours();
    if (!this.userBehavior.timeOfDayPreferences[to]) {
      this.userBehavior.timeOfDayPreferences[to] = [];
    }
    this.userBehavior.timeOfDayPreferences[to].push(hour);

    this.saveUserBehavior();
  }

  /**
   * Prefetch data for a specific route
   */
  private async prefetchForRoute(route: string): Promise<void> {
    if (!this.isEnabled) return;

    const rule = this.prefetchRules.find((r) => r.route === route);
    if (!rule) return;

    // Check conditions
    if (!this.shouldPrefetch(rule)) return;

    console.log(`[Prefetch] Prefetching data for route: ${route}`);

    // Sort targets by priority
    const sortedTargets = rule.prefetchTargets.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return (
        priorityOrder[b.config.priority] - priorityOrder[a.config.priority]
      );
    });

    // Prefetch with appropriate delays based on priority
    for (let i = 0; i < sortedTargets.length; i++) {
      const target = sortedTargets[i];

      if (!target.config.enabled) continue;

      // Add delay for lower priority items
      const delay =
        target.config.priority === "high"
          ? 0
          : target.config.priority === "medium"
          ? 100
          : 300;

      setTimeout(async () => {
        try {
          await this.queryClient.prefetchQuery({
            queryKey: target.queryKey,
            queryFn: target.queryFn,
            staleTime: target.config.maxAge,
          });

          console.log(`[Prefetch] Successfully prefetched:`, target.queryKey);
        } catch (error) {
          console.warn(
            `[Prefetch] Failed to prefetch:`,
            target.queryKey,
            error
          );
        }
      }, delay);
    }
  }

  /**
   * Check if prefetching should happen based on conditions
   */
  private shouldPrefetch(rule: PrefetchRule): boolean {
    if (!rule.conditions) return true;

    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();

    // Check time of day
    if (
      rule.conditions.timeOfDay &&
      !rule.conditions.timeOfDay.includes(currentHour)
    ) {
      return false;
    }

    // Check day of week
    if (
      rule.conditions.dayOfWeek &&
      !rule.conditions.dayOfWeek.includes(currentDay)
    ) {
      return false;
    }

    // Check user behavior conditions
    if (
      rule.conditions.userBehavior &&
      !rule.conditions.userBehavior(this.userBehavior)
    ) {
      return false;
    }

    return true;
  }

  /**
   * Analyze behavior and perform intelligent prefetching
   */
  private analyzeBehaviorAndPrefetch(): void {
    if (!this.isEnabled) return;

    // Predict next likely routes based on navigation patterns
    const currentRoute = this.currentRoute;
    const likelyNextRoutes = this.userBehavior.navigationPatterns
      .filter((p) => p.from === currentRoute)
      .sort((a, b) => b.count - a.count)
      .slice(0, 2) // Top 2 most likely next routes
      .map((p) => p.to);

    // Prefetch data for likely next routes
    likelyNextRoutes.forEach((route) => {
      this.prefetchForRoute(route);
    });

    // Prefetch frequently visited routes during preferred times
    const currentHour = new Date().getHours();
    Object.entries(this.userBehavior.timeOfDayPreferences).forEach(
      ([route, hours]) => {
        const preferredHours = hours.filter(
          (h, i, arr) => arr.indexOf(h) === i
        ); // unique hours
        if (preferredHours.includes(currentHour) && route !== currentRoute) {
          this.prefetchForRoute(route);
        }
      }
    );
  }

  /**
   * Load user behavior data from localStorage
   */
  private loadUserBehavior(): UserBehaviorData {
    if (typeof window === "undefined") {
      return {
        mostVisitedRoutes: [],
        timeSpentOnRoutes: {},
        navigationPatterns: [],
        timeOfDayPreferences: {},
        lastVisitTimes: {},
      };
    }

    try {
      const stored = localStorage.getItem("siap-undip-user-behavior");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn("[Prefetch] Failed to load user behavior data:", error);
    }

    return {
      mostVisitedRoutes: [],
      timeSpentOnRoutes: {},
      navigationPatterns: [],
      timeOfDayPreferences: {},
      lastVisitTimes: {},
    };
  }

  /**
   * Save user behavior data to localStorage
   */
  private saveUserBehavior(): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(
        "siap-undip-user-behavior",
        JSON.stringify(this.userBehavior)
      );
    } catch (error) {
      console.warn("[Prefetch] Failed to save user behavior data:", error);
    }
  }

  /**
   * Enable or disable prefetching
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    console.log(`[Prefetch] Prefetching ${enabled ? "enabled" : "disabled"}`);
  }

  /**
   * Add custom prefetch rule
   */
  public addRule(rule: PrefetchRule): void {
    this.prefetchRules.push(rule);
  }

  /**
   * Get user behavior analytics
   */
  public getBehaviorAnalytics(): UserBehaviorData {
    return { ...this.userBehavior };
  }

  /**
   * Clear user behavior data
   */
  public clearBehaviorData(): void {
    this.userBehavior = {
      mostVisitedRoutes: [],
      timeSpentOnRoutes: {},
      navigationPatterns: [],
      timeOfDayPreferences: {},
      lastVisitTimes: {},
    };
    this.saveUserBehavior();
  }
}

// Global prefetch manager instance
let prefetchManager: PrefetchManager | null = null;

/**
 * Initialize prefetch manager
 */
export function initializePrefetchManager(
  queryClient: QueryClient
): PrefetchManager {
  if (!prefetchManager) {
    prefetchManager = new PrefetchManager(queryClient);
  }
  return prefetchManager;
}

/**
 * Get current prefetch manager instance
 */
export function getPrefetchManager(): PrefetchManager | null {
  return prefetchManager;
}

/**
 * Enable/disable prefetching
 */
export function setPrefetchingEnabled(enabled: boolean): void {
  prefetchManager?.setEnabled(enabled);
}

/**
 * Add custom prefetch rule
 */
export function addPrefetchRule(rule: PrefetchRule): void {
  prefetchManager?.addRule(rule);
}

/**
 * Get user behavior analytics
 */
export function getUserBehaviorAnalytics(): UserBehaviorData | null {
  return prefetchManager?.getBehaviorAnalytics() || null;
}
