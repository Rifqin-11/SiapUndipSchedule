"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import {
  initializeABTesting,
  getABTestInstance,
  getVariant,
  getVariantConfig,
  isInVariant,
  trackConversion,
  setABTestUserId,
  ABTestVariant,
  ABTestExperiment,
} from "@/lib/ab-testing";

interface UseABTestingOptions {
  enabled?: boolean;
  debugMode?: boolean;
}

interface ABTestHookReturn {
  getVariant: (experimentId: string) => ABTestVariant | null;
  getConfig: (experimentId: string) => Record<string, any> | null;
  isInVariant: (experimentId: string, variantId: string) => boolean;
  trackConversion: (
    experimentId: string,
    metricName: string,
    value?: any
  ) => void;
  getActiveExperiments: () => Array<{
    experiment: ABTestExperiment;
    variant: ABTestVariant;
  }>;
  isLoading: boolean;
  debugInfo: {
    userId?: string;
    totalExperiments: number;
    activeAssignments: number;
  };
}

/**
 * Hook for A/B testing functionality
 */
export function useABTesting(
  options: UseABTestingOptions = {}
): ABTestHookReturn {
  const authContext = useAuth();
  const user = authContext?.user; // Safe access
  const [isLoading, setIsLoading] = useState(true);
  const [abTest, setAbTest] = useState<any>(null);

  useEffect(() => {
    // Initialize A/B testing framework
    const abTestInstance = initializeABTesting({
      enabled: options.enabled ?? true,
      debugMode: options.debugMode ?? process.env.NODE_ENV === "development",
      userId: user?.nim || undefined,
      userAttributes: user
        ? {
            userType: "student",
            registrationDate: new Date().toISOString(),
            isNewUser: true, // Assume new user by default
          }
        : {},
    });

    setAbTest(abTestInstance);

    // Set user ID when available
    if (user?.nim) {
      setABTestUserId(user.nim);
    }

    setIsLoading(false);
  }, [user, options.enabled, options.debugMode]);

  const getVariantForExperiment = (
    experimentId: string
  ): ABTestVariant | null => {
    if (!abTest || isLoading) return null;
    return getVariant(experimentId, user?.nim || undefined);
  };

  const getConfigForExperiment = (
    experimentId: string
  ): Record<string, any> | null => {
    if (!abTest || isLoading) return null;
    return getVariantConfig(experimentId, user?.nim || undefined);
  };

  const checkIsInVariant = (
    experimentId: string,
    variantId: string
  ): boolean => {
    if (!abTest || isLoading) return false;
    return isInVariant(experimentId, variantId, user?.nim || undefined);
  };

  const trackConversionForExperiment = (
    experimentId: string,
    metricName: string,
    value?: any
  ): void => {
    if (!abTest || isLoading) return;
    trackConversion(experimentId, metricName, value, user?.nim || undefined);
  };

  const getActiveExperiments = (): Array<{
    experiment: ABTestExperiment;
    variant: ABTestVariant;
  }> => {
    if (!abTest || isLoading) return [];
    return abTest.getActiveExperiments(user?.nim || undefined);
  };

  const debugInfo = {
    userId: user?.nim || undefined,
    totalExperiments: abTest?.getExperiments().length || 0,
    activeAssignments: getActiveExperiments().length,
  };

  return {
    getVariant: getVariantForExperiment,
    getConfig: getConfigForExperiment,
    isInVariant: checkIsInVariant,
    trackConversion: trackConversionForExperiment,
    getActiveExperiments,
    isLoading,
    debugInfo,
  };
}

/**
 * Hook for caching strategy A/B test
 */
export function useCacheStrategy() {
  const { getConfig, trackConversion } = useABTesting();

  const cacheConfig = getConfig("cache_strategy_test") || {
    staleTime: 5 * 60 * 1000, // Default: 5 minutes
    gcTime: 10 * 60 * 1000, // Default: 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  };

  const trackCacheHit = () => {
    trackConversion("cache_strategy_test", "cache_hit_rate", 1);
  };

  const trackCacheMiss = () => {
    trackConversion("cache_strategy_test", "cache_hit_rate", 0);
  };

  const trackApiResponse = (responseTime: number) => {
    trackConversion("cache_strategy_test", "api_response_time", responseTime);
  };

  return {
    cacheConfig,
    trackCacheHit,
    trackCacheMiss,
    trackApiResponse,
  };
}

/**
 * Hook for homepage layout A/B test
 */
export function useHomepageLayout() {
  const { getConfig, trackConversion, isInVariant } = useABTesting();

  const layoutConfig = getConfig("homepage_layout_test") || {
    layout: "cards",
    showTodayFirst: true,
    compactMode: false,
  };

  const isCardsLayout = isInVariant("homepage_layout_test", "cards_layout");
  const isListLayout = isInVariant("homepage_layout_test", "list_layout");

  const trackTimeOnPage = (seconds: number) => {
    trackConversion("homepage_layout_test", "time_on_page", seconds);
  };

  const trackClickThrough = (section: string) => {
    trackConversion("homepage_layout_test", "click_through_rate", section);
  };

  const trackTaskCompletion = (taskType: string) => {
    trackConversion("homepage_layout_test", "task_completion_rate", taskType);
  };

  return {
    layoutConfig,
    isCardsLayout,
    isListLayout,
    trackTimeOnPage,
    trackClickThrough,
    trackTaskCompletion,
  };
}

/**
 * Hook for notification frequency A/B test
 */
export function useNotificationFrequency() {
  const { getConfig, trackConversion, isInVariant } = useABTesting();

  const notificationConfig = getConfig("notification_frequency_test") || {
    classReminder: 15, // Default: 15 minutes before
    taskReminder: [24], // Default: 24 hours before
    scheduleUpdates: false,
  };

  const isHighFrequency = isInVariant(
    "notification_frequency_test",
    "high_frequency"
  );
  const isMediumFrequency = isInVariant(
    "notification_frequency_test",
    "medium_frequency"
  );
  const isLowFrequency = isInVariant(
    "notification_frequency_test",
    "low_frequency"
  );

  const trackNotificationEngagement = (type: string, engaged: boolean) => {
    trackConversion("notification_frequency_test", "notification_engagement", {
      type,
      engaged,
      timestamp: new Date(),
    });
  };

  const trackAppRetention = (daysActive: number) => {
    trackConversion("notification_frequency_test", "app_retention", daysActive);
  };

  const trackUserSatisfaction = (rating: number) => {
    trackConversion("notification_frequency_test", "user_satisfaction", rating);
  };

  return {
    notificationConfig,
    isHighFrequency,
    isMediumFrequency,
    isLowFrequency,
    trackNotificationEngagement,
    trackAppRetention,
    trackUserSatisfaction,
  };
}

/**
 * Hook for general experiment tracking
 */
export function useExperimentTracking() {
  const { trackConversion, getActiveExperiments, debugInfo } = useABTesting();

  const trackPageView = (page: string) => {
    const experiments = getActiveExperiments();
    experiments.forEach(({ experiment }) => {
      trackConversion(experiment.id, "page_view", page);
    });
  };

  const trackUserAction = (action: string, metadata?: any) => {
    const experiments = getActiveExperiments();
    experiments.forEach(({ experiment }) => {
      trackConversion(experiment.id, "user_action", {
        action,
        metadata,
        timestamp: new Date(),
      });
    });
  };

  const trackPerformanceMetric = (metric: string, value: number) => {
    const experiments = getActiveExperiments();
    experiments.forEach(({ experiment }) => {
      if (experiment.metrics.includes(metric)) {
        trackConversion(experiment.id, metric, value);
      }
    });
  };

  return {
    trackPageView,
    trackUserAction,
    trackPerformanceMetric,
    activeExperiments: getActiveExperiments(),
    debugInfo,
  };
}

/**
 * Get debug information for A/B testing
 */
export function useABTestingDebug() {
  const { getActiveExperiments, debugInfo } = useABTesting();

  return {
    ...debugInfo,
    activeExperiments: getActiveExperiments(),
    isDebugMode: process.env.NODE_ENV === "development",
  };
}
