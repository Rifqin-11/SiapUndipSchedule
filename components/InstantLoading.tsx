"use client";

import { useEffect, useState } from "react";

interface InstantLoadingProps {
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  minimumShowTime?: number; // Minimum time to show loading (prevents flash)
}

/**
 * Component for instant UI feedback while async operations complete
 * Shows loading immediately without waiting for data
 */
export default function InstantLoading({
  children,
  loadingComponent,
  minimumShowTime = 150,
}: InstantLoadingProps) {
  const [showContent, setShowContent] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    // Ensure minimum loading time to prevent flash
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, minimumShowTime);

    return () => clearTimeout(timer);
  }, [minimumShowTime]);

  useEffect(() => {
    // Show content once minimum time has elapsed
    if (minTimeElapsed) {
      setShowContent(true);
    }
  }, [minTimeElapsed]);

  if (!showContent) {
    return loadingComponent || <DefaultInstantLoading />;
  }

  return <>{children}</>;
}

function DefaultInstantLoading() {
  return (
    <div className="animate-pulse space-y-4 p-4">
      {/* Header skeleton */}
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4"></div>

      {/* Content skeletons */}
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
      </div>

      {/* Card skeletons */}
      <div className="space-y-3">
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
    </div>
  );
}
