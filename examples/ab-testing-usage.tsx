/**
 * Example usage of A/B Testing Framework
 *
 * This file shows how to use the A/B testing hooks in your components
 * to create different user experiences and track performance.
 */

import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useExperiment } from "@/components/ABTestingProvider";
import {
  useCacheStrategy,
  useHomepageLayout,
  useNotificationFrequency,
} from "@/hooks/useABTesting";

// Example 1: Using cache strategy experiment
function DataComponent() {
  const { cacheConfig, trackCacheHit, trackApiResponse } = useCacheStrategy();

  // Use cache config in React Query
  const { data, isLoading } = useQuery({
    queryKey: ["example-data"],
    queryFn: async () => {
      const start = Date.now();
      const response = await fetch("/api/data");
      const result = await response.json();

      // Track API response time
      trackApiResponse(Date.now() - start);
      return result;
    },
    staleTime: cacheConfig.staleTime,
    gcTime: cacheConfig.gcTime,
    refetchOnWindowFocus: cacheConfig.refetchOnWindowFocus,
    refetchOnMount: cacheConfig.refetchOnMount,
  });

  // Track cache performance
  useEffect(() => {
    if (data && !isLoading) {
      trackCacheHit();
    }
  }, [data, isLoading, trackCacheHit]);

  return (
    <div>
      <h3>Data Component (Cache Strategy: {cacheConfig.staleTime}ms)</h3>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <p>Data loaded: {JSON.stringify(data)}</p>
      )}
    </div>
  );
}

// Example 2: Using homepage layout experiment
function HomeLayout() {
  const { layoutConfig, isCardsLayout, trackClickThrough } =
    useHomepageLayout();

  const handleCardClick = (cardType: string) => {
    trackClickThrough(cardType);
    console.log(`Clicked: ${cardType}`);
  };

  return (
    <div>
      <h3>Homepage Layout: {layoutConfig.layout}</h3>
      {isCardsLayout ? (
        <div className="grid grid-cols-2 gap-4">
          <div
            className="p-4 border rounded cursor-pointer"
            onClick={() => handleCardClick("schedule")}
          >
            Schedule Card
          </div>
          <div
            className="p-4 border rounded cursor-pointer"
            onClick={() => handleCardClick("tasks")}
          >
            Tasks Card
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div
            className="p-2 border-l-4 border-blue-500 cursor-pointer"
            onClick={() => handleCardClick("schedule")}
          >
            → Schedule
          </div>
          <div
            className="p-2 border-l-4 border-blue-500 cursor-pointer"
            onClick={() => handleCardClick("tasks")}
          >
            → Tasks
          </div>
        </div>
      )}
    </div>
  );
}

// Example 3: Using notification frequency experiment
function NotificationDemo() {
  const { notificationConfig, trackNotificationEngagement } =
    useNotificationFrequency();

  const handleNotificationClick = (type: string) => {
    trackNotificationEngagement(type, true);
    alert(`Notification clicked: ${type}`);
  };

  return (
    <div>
      <h3>Notification Settings</h3>
      <div className="space-y-2">
        <p>Class reminder: {notificationConfig.classReminder} minutes before</p>
        <p>
          Task reminders: {notificationConfig.taskReminder.join(", ")} hours
          before
        </p>
        <p>
          Schedule updates:{" "}
          {notificationConfig.scheduleUpdates ? "Enabled" : "Disabled"}
        </p>

        <button
          onClick={() => handleNotificationClick("class_reminder")}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Test Class Reminder
        </button>
      </div>
    </div>
  );
}

// Example 4: Using general experiment hook
function CustomExperiment() {
  const { variant, config, isInVariant, trackConversion } = useExperiment(
    "cache_strategy_test"
  );

  useEffect(() => {
    if (variant) {
      console.log(`User is in variant: ${variant.name}`);
    }
  }, [variant]);

  const handleFeatureUse = () => {
    trackConversion("feature_engagement", 1);
    console.log("Feature engagement tracked");
  };

  if (isInVariant("aggressive_cache")) {
    return (
      <div className="p-4 bg-green-100 border border-green-500 rounded">
        <h3>Aggressive Caching Variant</h3>
        <p>Using aggressive caching strategy</p>
        <button
          onClick={handleFeatureUse}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Use Feature (Aggressive)
        </button>
      </div>
    );
  } else if (isInVariant("conservative_cache")) {
    return (
      <div className="p-4 bg-yellow-100 border border-yellow-500 rounded">
        <h3>Conservative Caching Variant</h3>
        <p>Using conservative caching strategy</p>
        <button
          onClick={handleFeatureUse}
          className="px-4 py-2 bg-yellow-500 text-white rounded"
        >
          Use Feature (Conservative)
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-100 border border-blue-500 rounded">
      <h3>Default Variant</h3>
      <p>Using moderate caching strategy</p>
      <button
        onClick={handleFeatureUse}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Use Feature (Default)
      </button>
    </div>
  );
}

// Main example component showing all A/B tests
export function ABTestingExamples() {
  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold">A/B Testing Framework Examples</h1>

      <div className="space-y-6">
        <DataComponent />
        <HomeLayout />
        <NotificationDemo />
        <CustomExperiment />
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">How to implement A/B testing:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>
            Use the appropriate hook (useCacheStrategy, useHomepageLayout, etc.)
          </li>
          <li>Get the experiment configuration and variant information</li>
          <li>Render different UI based on the variant</li>
          <li>Track user interactions and conversions</li>
          <li>Analyze results to determine winning variants</li>
        </ol>
      </div>
    </div>
  );
}
