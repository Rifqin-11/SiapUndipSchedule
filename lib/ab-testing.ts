// A/B Testing framework for feature variations and caching strategies
// Supports user segmentation, feature flags, and experiment tracking

export interface ABTestVariant {
  id: string;
  name: string;
  weight: number; // 0-100, percentage of users assigned to this variant
  config: Record<string, any>;
  description?: string;
}

export interface ABTestExperiment {
  id: string;
  name: string;
  description?: string;
  status: "draft" | "running" | "paused" | "completed";
  variants: ABTestVariant[];
  targetingRules?: {
    userType?: string[];
    newUsers?: boolean;
    timeRange?: { start: Date; end: Date };
    customRules?: (user: any) => boolean;
  };
  metrics: string[]; // Metrics to track for this experiment
  startDate?: Date;
  endDate?: Date;
}

export interface ABTestAssignment {
  experimentId: string;
  variantId: string;
  userId: string;
  assignedAt: Date;
  metadata?: Record<string, any>;
}

export interface ABTestConfig {
  enabled: boolean;
  userId?: string;
  userAttributes?: Record<string, any>;
  persistAssignments: boolean;
  trackingEndpoint?: string;
  debugMode: boolean;
}

export class ABTestingFramework {
  private config: ABTestConfig;
  private experiments: Map<string, ABTestExperiment> = new Map();
  private assignments: Map<string, ABTestAssignment> = new Map();
  private metrics: Map<string, any[]> = new Map();

  constructor(config: ABTestConfig) {
    this.config = config;
    this.loadAssignments();
    this.setupDefaultExperiments();
  }

  /**
   * Setup default experiments for the application
   */
  private setupDefaultExperiments(): void {
    // Experiment 1: Caching Strategy
    this.addExperiment({
      id: "cache_strategy_test",
      name: "Caching Strategy Optimization",
      description: "Test different caching strategies for better performance",
      status: "running",
      variants: [
        {
          id: "aggressive_cache",
          name: "Aggressive Caching",
          weight: 30,
          config: {
            staleTime: 10 * 60 * 1000, // 10 minutes
            gcTime: 30 * 60 * 1000, // 30 minutes
            refetchOnWindowFocus: false,
            refetchOnMount: false,
          },
        },
        {
          id: "moderate_cache",
          name: "Moderate Caching",
          weight: 40,
          config: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes
            refetchOnWindowFocus: false,
            refetchOnMount: true,
          },
        },
        {
          id: "conservative_cache",
          name: "Conservative Caching",
          weight: 30,
          config: {
            staleTime: 30 * 1000, // 30 seconds
            gcTime: 2 * 60 * 1000, // 2 minutes
            refetchOnWindowFocus: true,
            refetchOnMount: "always",
          },
        },
      ],
      metrics: [
        "page_load_time",
        "api_response_time",
        "cache_hit_rate",
        "user_satisfaction",
      ],
    });

    // Experiment 2: UI Layout Variations
    this.addExperiment({
      id: "homepage_layout_test",
      name: "Homepage Layout Optimization",
      description: "Test different homepage layouts for better user engagement",
      status: "running",
      variants: [
        {
          id: "cards_layout",
          name: "Card-based Layout",
          weight: 50,
          config: {
            layout: "cards",
            showTodayFirst: true,
            compactMode: false,
          },
        },
        {
          id: "list_layout",
          name: "List-based Layout",
          weight: 50,
          config: {
            layout: "list",
            showTodayFirst: false,
            compactMode: true,
          },
        },
      ],
      metrics: ["time_on_page", "click_through_rate", "task_completion_rate"],
    });

    // Experiment 3: Notification Frequency
    this.addExperiment({
      id: "notification_frequency_test",
      name: "Notification Frequency Optimization",
      description:
        "Test different notification frequencies for better user experience",
      status: "running",
      variants: [
        {
          id: "high_frequency",
          name: "High Frequency Notifications",
          weight: 25,
          config: {
            classReminder: 15, // 15 minutes before
            taskReminder: [24, 1], // 24 hours and 1 hour before
            scheduleUpdates: true,
          },
        },
        {
          id: "medium_frequency",
          name: "Medium Frequency Notifications",
          weight: 50,
          config: {
            classReminder: 15, // 15 minutes before
            taskReminder: [24], // 24 hours before only
            scheduleUpdates: false,
          },
        },
        {
          id: "low_frequency",
          name: "Low Frequency Notifications",
          weight: 25,
          config: {
            classReminder: 5, // 5 minutes before
            taskReminder: [1], // 1 hour before only
            scheduleUpdates: false,
          },
        },
      ],
      metrics: [
        "notification_engagement",
        "app_retention",
        "user_satisfaction",
      ],
    });
  }

  /**
   * Add a new experiment
   */
  public addExperiment(experiment: ABTestExperiment): void {
    // Validate experiment
    if (!this.validateExperiment(experiment)) {
      throw new Error(`Invalid experiment configuration: ${experiment.id}`);
    }

    this.experiments.set(experiment.id, experiment);

    if (this.config.debugMode) {
      console.log(`[A/B Test] Added experiment: ${experiment.name}`);
    }
  }

  /**
   * Get variant assignment for a user and experiment
   */
  public getVariant(
    experimentId: string,
    userId?: string
  ): ABTestVariant | null {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || experiment.status !== "running") {
      return null;
    }

    const userIdToUse = userId || this.config.userId;
    if (!userIdToUse) {
      return null;
    }

    // Check if user already has an assignment
    const existingAssignment = this.assignments.get(
      `${experimentId}_${userIdToUse}`
    );
    if (existingAssignment) {
      const variant = experiment.variants.find(
        (v) => v.id === existingAssignment.variantId
      );
      if (variant) {
        return variant;
      }
    }

    // Check targeting rules
    if (!this.matchesTargetingRules(experiment, userIdToUse)) {
      return null;
    }

    // Assign user to a variant
    const variant = this.assignUserToVariant(experiment, userIdToUse);
    if (variant) {
      const assignment: ABTestAssignment = {
        experimentId,
        variantId: variant.id,
        userId: userIdToUse,
        assignedAt: new Date(),
        metadata: this.config.userAttributes,
      };

      this.assignments.set(`${experimentId}_${userIdToUse}`, assignment);
      this.saveAssignments();

      if (this.config.debugMode) {
        console.log(
          `[A/B Test] User ${userIdToUse} assigned to variant ${variant.id} in experiment ${experimentId}`
        );
      }

      // Track assignment event
      this.trackEvent(experimentId, "variant_assigned", {
        variantId: variant.id,
        userId: userIdToUse,
      });
    }

    return variant;
  }

  /**
   * Get configuration for a specific experiment variant
   */
  public getVariantConfig(
    experimentId: string,
    userId?: string
  ): Record<string, any> | null {
    const variant = this.getVariant(experimentId, userId);
    return variant ? variant.config : null;
  }

  /**
   * Check if user is in a specific variant
   */
  public isInVariant(
    experimentId: string,
    variantId: string,
    userId?: string
  ): boolean {
    const variant = this.getVariant(experimentId, userId);
    return variant?.id === variantId;
  }

  /**
   * Track conversion or metric for an experiment
   */
  public trackConversion(
    experimentId: string,
    metricName: string,
    value: any = 1,
    userId?: string
  ): void {
    const userIdToUse = userId || this.config.userId;
    if (!userIdToUse) return;

    const variant = this.getVariant(experimentId, userIdToUse);
    if (!variant) return;

    this.trackEvent(experimentId, "conversion", {
      metricName,
      value,
      variantId: variant.id,
      userId: userIdToUse,
    });

    if (this.config.debugMode) {
      console.log(
        `[A/B Test] Conversion tracked: ${metricName} = ${value} for variant ${variant.id}`
      );
    }
  }

  /**
   * Get all active experiments for a user
   */
  public getActiveExperiments(
    userId?: string
  ): Array<{ experiment: ABTestExperiment; variant: ABTestVariant }> {
    const userIdToUse = userId || this.config.userId;
    if (!userIdToUse) return [];

    const active: Array<{
      experiment: ABTestExperiment;
      variant: ABTestVariant;
    }> = [];

    for (const experiment of this.experiments.values()) {
      if (experiment.status === "running") {
        const variant = this.getVariant(experiment.id, userIdToUse);
        if (variant) {
          active.push({ experiment, variant });
        }
      }
    }

    return active;
  }

  /**
   * Force assignment to a specific variant (for testing)
   */
  public forceVariant(
    experimentId: string,
    variantId: string,
    userId?: string
  ): boolean {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) return false;

    const variant = experiment.variants.find((v) => v.id === variantId);
    if (!variant) return false;

    const userIdToUse = userId || this.config.userId;
    if (!userIdToUse) return false;

    const assignment: ABTestAssignment = {
      experimentId,
      variantId,
      userId: userIdToUse,
      assignedAt: new Date(),
      metadata: { forced: true, ...this.config.userAttributes },
    };

    this.assignments.set(`${experimentId}_${userIdToUse}`, assignment);
    this.saveAssignments();

    if (this.config.debugMode) {
      console.log(
        `[A/B Test] Forced assignment: User ${userIdToUse} to variant ${variantId}`
      );
    }

    return true;
  }

  // Private helper methods

  private validateExperiment(experiment: ABTestExperiment): boolean {
    if (!experiment.id || !experiment.name || !experiment.variants.length) {
      return false;
    }

    const totalWeight = experiment.variants.reduce(
      (sum, variant) => sum + variant.weight,
      0
    );
    if (Math.abs(totalWeight - 100) > 0.01) {
      console.warn(
        `[A/B Test] Experiment ${experiment.id} variant weights don't sum to 100%`
      );
    }

    return true;
  }

  private matchesTargetingRules(
    experiment: ABTestExperiment,
    userId: string
  ): boolean {
    if (!experiment.targetingRules) return true;

    const rules = experiment.targetingRules;

    // Check custom rules
    if (rules.customRules && !rules.customRules(this.config.userAttributes)) {
      return false;
    }

    // Check time range
    if (rules.timeRange) {
      const now = new Date();
      if (now < rules.timeRange.start || now > rules.timeRange.end) {
        return false;
      }
    }

    return true;
  }

  private assignUserToVariant(
    experiment: ABTestExperiment,
    userId: string
  ): ABTestVariant | null {
    // Use deterministic hash-based assignment
    const hash = this.hashUserId(userId + experiment.id);
    const randomValue = hash % 100;

    let cumulativeWeight = 0;
    for (const variant of experiment.variants) {
      cumulativeWeight += variant.weight;
      if (randomValue < cumulativeWeight) {
        return variant;
      }
    }

    return experiment.variants[0]; // Fallback to first variant
  }

  private hashUserId(input: string): number {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private trackEvent(experimentId: string, eventType: string, data: any): void {
    const event = {
      experimentId,
      eventType,
      timestamp: new Date(),
      ...data,
    };

    // Store locally
    if (!this.metrics.has(experimentId)) {
      this.metrics.set(experimentId, []);
    }
    this.metrics.get(experimentId)!.push(event);

    // Send to tracking endpoint if configured
    if (this.config.trackingEndpoint) {
      fetch(this.config.trackingEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      }).catch((error) => {
        console.warn("[A/B Test] Failed to send tracking data:", error);
      });
    }
  }

  private loadAssignments(): void {
    if (!this.config.persistAssignments || typeof window === "undefined")
      return;

    try {
      const stored = localStorage.getItem("ab_test_assignments");
      if (stored) {
        const assignments = JSON.parse(stored);
        for (const [key, assignment] of Object.entries(assignments)) {
          this.assignments.set(key, {
            ...(assignment as ABTestAssignment),
            assignedAt: new Date((assignment as any).assignedAt),
          });
        }
      }
    } catch (error) {
      console.warn("[A/B Test] Failed to load assignments:", error);
    }
  }

  private saveAssignments(): void {
    if (!this.config.persistAssignments || typeof window === "undefined")
      return;

    try {
      const assignmentsObject: Record<string, ABTestAssignment> = {};
      for (const [key, assignment] of this.assignments.entries()) {
        assignmentsObject[key] = assignment;
      }
      localStorage.setItem(
        "ab_test_assignments",
        JSON.stringify(assignmentsObject)
      );
    } catch (error) {
      console.warn("[A/B Test] Failed to save assignments:", error);
    }
  }

  /**
   * Public utility methods
   */
  public setUserId(userId: string): void {
    this.config.userId = userId;
  }

  public setUserAttributes(attributes: Record<string, any>): void {
    this.config.userAttributes = {
      ...this.config.userAttributes,
      ...attributes,
    };
  }

  public getExperiments(): ABTestExperiment[] {
    return Array.from(this.experiments.values());
  }

  public getMetrics(experimentId: string): any[] {
    return this.metrics.get(experimentId) || [];
  }

  public clearAssignments(): void {
    this.assignments.clear();
    this.saveAssignments();
  }
}

// Global A/B testing instance
let abTestInstance: ABTestingFramework | null = null;

/**
 * Initialize A/B testing framework
 */
export function initializeABTesting(
  config: Partial<ABTestConfig> = {}
): ABTestingFramework {
  if (!abTestInstance) {
    const defaultConfig: ABTestConfig = {
      enabled: true,
      persistAssignments: true,
      debugMode: process.env.NODE_ENV === "development",
      ...config,
    };

    abTestInstance = new ABTestingFramework(defaultConfig);
  }
  return abTestInstance;
}

/**
 * Get current A/B testing instance
 */
export function getABTestInstance(): ABTestingFramework | null {
  return abTestInstance;
}

/**
 * Get variant for an experiment
 */
export function getVariant(
  experimentId: string,
  userId?: string
): ABTestVariant | null {
  return abTestInstance?.getVariant(experimentId, userId) || null;
}

/**
 * Get variant configuration
 */
export function getVariantConfig(
  experimentId: string,
  userId?: string
): Record<string, any> | null {
  return abTestInstance?.getVariantConfig(experimentId, userId) || null;
}

/**
 * Check if user is in a specific variant
 */
export function isInVariant(
  experimentId: string,
  variantId: string,
  userId?: string
): boolean {
  return abTestInstance?.isInVariant(experimentId, variantId, userId) || false;
}

/**
 * Track conversion
 */
export function trackConversion(
  experimentId: string,
  metricName: string,
  value?: any,
  userId?: string
): void {
  abTestInstance?.trackConversion(experimentId, metricName, value, userId);
}

/**
 * Set user ID for A/B testing
 */
export function setABTestUserId(userId: string): void {
  abTestInstance?.setUserId(userId);
}
