"use client";

import { ReactNode, useState } from "react";
import { WifiOff, RefreshCw, Database, AlertCircle } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

interface OfflineDataWrapperProps {
  children: ReactNode;
  isLoading?: boolean;
  error?: Error | null;
  hasData?: boolean;
  hasCachedData?: boolean;
  onRetry?: () => void;
  fallbackTitle?: string;
  fallbackDescription?: string;
  showRetryButton?: boolean;
  showCacheIndicator?: boolean;
}

/**
 * Wrapper component yang menangani tampilan saat offline
 * dan memberikan feedback yang sesuai berdasarkan status data
 */
export default function OfflineDataWrapper({
  children,
  isLoading = false,
  error = null,
  hasData = false,
  hasCachedData = false,
  onRetry,
  fallbackTitle = "No Data Available",
  fallbackDescription = "Unable to load data while offline",
  showRetryButton = true,
  showCacheIndicator = true,
}: OfflineDataWrapperProps) {
  const { isOnline, isOffline } = useOnlineStatus();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (onRetry) {
      setIsRetrying(true);
      try {
        await onRetry();
      } finally {
        setIsRetrying(false);
      }
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <RefreshCw className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin mb-4" />
        <p className="text-gray-600 dark:text-gray-300 text-center">
          {isOffline ? "Loading cached data..." : "Loading..."}
        </p>
      </div>
    );
  }

  // Show error state when online
  if (error && isOnline) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Something went wrong
        </h3>

        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">
          {error.message || "An unexpected error occurred"}
        </p>

        {showRetryButton && onRetry && (
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRetrying ? "animate-spin" : ""}`}
            />
            {isRetrying ? "Retrying..." : "Try Again"}
          </button>
        )}
      </div>
    );
  }

  // Show offline state without cached data
  if (isOffline && !hasData && !hasCachedData) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <WifiOff className="w-8 h-8 text-gray-600 dark:text-gray-400" />
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {fallbackTitle}
        </h3>

        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">
          {fallbackDescription}
        </p>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          Data will be available when you're back online
        </div>
      </div>
    );
  }

  // Show data with cache indicator if offline
  return (
    <div className="relative">
      {/* Cache indicator */}
      {isOffline && hasCachedData && showCacheIndicator && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
            <Database className="w-4 h-4" />
            <span className="text-sm font-medium">Viewing cached data</span>
          </div>
          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
            This data may not be up to date. Connect to the internet to get the
            latest information.
          </p>
        </div>
      )}

      {/* Main content */}
      {children}

      {/* Retry button for offline state with cached data */}
      {isOffline && hasCachedData && showRetryButton && onRetry && (
        <div className="mt-4 text-center">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors text-sm"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRetrying ? "animate-spin" : ""}`}
            />
            {isRetrying ? "Checking..." : "Check for Updates"}
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Simplified version for basic offline/online state
 */
export function OfflineStateIndicator({
  isOffline,
  className = "",
}: {
  isOffline: boolean;
  className?: string;
}) {
  if (!isOffline) return null;

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-full text-xs ${className}`}
    >
      <WifiOff className="w-3 h-3" />
      <span>Offline</span>
    </div>
  );
}

/**
 * Cache age indicator
 */
export function CacheAgeIndicator({
  timestamp,
  className = "",
}: {
  timestamp: number;
  className?: string;
}) {
  const age = Date.now() - timestamp;
  const minutes = Math.floor(age / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  let ageText = "";
  if (days > 0) {
    ageText = `${days}d ago`;
  } else if (hours > 0) {
    ageText = `${hours}h ago`;
  } else if (minutes > 0) {
    ageText = `${minutes}m ago`;
  } else {
    ageText = "Just now";
  }

  return (
    <span className={`text-xs text-gray-500 dark:text-gray-400 ${className}`}>
      Cached {ageText}
    </span>
  );
}
