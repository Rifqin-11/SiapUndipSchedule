"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Wifi,
  WifiOff,
  Database,
  Clock,
  RefreshCw,
  Trash2,
  Info,
  Calendar,
  CheckSquare,
  User,
  Settings,
  Home,
} from "lucide-react";
import { useOnlineStatus, useRetryOnOnline } from "@/hooks/useOnlineStatus";
import { useOfflineSync } from "@/hooks/useOfflineData";
import { offlineDataManager } from "@/lib/offline-manager";

export default function OfflinePage() {
  const router = useRouter();
  const { isOnline, isOffline, lastOnlineAt, connectionType, effectiveType } =
    useOnlineStatus();
  const { syncInProgress } = useOfflineSync();

  const [cacheStats, setCacheStats] = useState({
    totalItems: 0,
    totalSize: "0 KB",
    queueSize: 0,
    oldestItem: undefined as string | undefined,
    newestItem: undefined as string | undefined,
  });

  const [isClearing, setIsClearing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Update cache stats
  const updateCacheStats = () => {
    const stats = offlineDataManager.getCacheStats();
    setCacheStats({
      totalItems: stats.totalItems,
      totalSize: stats.totalSize,
      queueSize: stats.queueSize,
      oldestItem: stats.oldestItem,
      newestItem: stats.newestItem,
    });
  };

  useEffect(() => {
    document.title = isOnline
      ? "Back Online - SIAP UNDIP Schedule"
      : "Offline - SIAP UNDIP Schedule";
    updateCacheStats();
  }, [isOnline]);

  // Retry mechanism saat kembali online
  useRetryOnOnline(() => {
    console.log("[OfflinePage] Retrying after coming back online");
    updateCacheStats();
  });

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      offlineDataManager.clearCache();
      offlineDataManager.clearQueue();
      updateCacheStats();

      // Show success message
      setTimeout(() => {
        setIsClearing(false);
      }, 1000);
    } catch (error) {
      console.error("Failed to clear cache:", error);
      setIsClearing(false);
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    router.push("/");
  };

  const getConnectionStatus = () => {
    if (isOnline) {
      return {
        icon: Wifi,
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-100 dark:bg-green-900/30",
        title: "You're Online",
        description: "All features are available",
      };
    } else {
      return {
        icon: WifiOff,
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-100 dark:bg-red-900/30",
        title: "You're Offline",
        description: "Limited features available",
      };
    }
  };

  const status = getConnectionStatus();
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Main Status Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          <div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${status.bgColor} mb-6`}
          >
            <StatusIcon className={`w-10 h-10 ${status.color}`} />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {status.title}
          </h1>

          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {status.description}
          </p>

          {/* Connection Info */}
          {isOnline && (connectionType || effectiveType) && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full text-sm text-blue-700 dark:text-blue-300 mb-6">
              <Info className="w-4 h-4" />
              {connectionType && <span>Type: {connectionType}</span>}
              {effectiveType && <span>Speed: {effectiveType}</span>}
            </div>
          )}

          {/* Last Online Info */}
          {isOffline && lastOnlineAt && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
              <Clock className="w-4 h-4" />
              <span>Last online: {lastOnlineAt.toLocaleString()}</span>
            </div>
          )}

          {/* Sync Status */}
          {syncInProgress && (
            <div className="flex items-center justify-center gap-2 text-sm text-blue-600 dark:text-blue-400 mb-6">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Syncing data...</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>

            <button
              onClick={handleGoHome}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go Home
            </button>
          </div>
        </div>

        {/* Offline Features Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Available Offline Features
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                icon: Calendar,
                title: "Cached Schedule",
                description: "View your saved class schedule",
                available: cacheStats.totalItems > 0,
              },
              {
                icon: CheckSquare,
                title: "Saved Tasks",
                description: "Access your saved assignments and tasks",
                available: cacheStats.totalItems > 0,
              },
              {
                icon: User,
                title: "Profile Data",
                description: "View your profile information",
                available: cacheStats.totalItems > 0,
              },
              {
                icon: Settings,
                title: "App Settings",
                description: "Modify app preferences",
                available: true,
              },
            ].map((feature, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  feature.available
                    ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20"
                    : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20"
                }`}
              >
                <div className="flex items-start gap-3">
                  <feature.icon
                    className={`w-5 h-5 mt-0.5 ${
                      feature.available
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  />
                  <div>
                    <h3
                      className={`font-medium ${
                        feature.available
                          ? "text-green-900 dark:text-green-100"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {feature.title}
                    </h3>
                    <p
                      className={`text-sm ${
                        feature.available
                          ? "text-green-700 dark:text-green-300"
                          : "text-gray-400 dark:text-gray-500"
                      }`}
                    >
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cache Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Offline Data
            </h2>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
            >
              {showAdvanced ? "Hide Details" : "Show Details"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {cacheStats.totalItems}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Cached Items
              </div>
            </div>

            <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {cacheStats.totalSize}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Storage Used
              </div>
            </div>

            <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {cacheStats.queueSize}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Pending Sync
              </div>
            </div>
          </div>

          {showAdvanced && (
            <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              {cacheStats.oldestItem && (
                <div className="text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Oldest cache:
                  </span>
                  <span className="ml-2 text-gray-900 dark:text-white">
                    {cacheStats.oldestItem}
                  </span>
                </div>
              )}

              {cacheStats.newestItem && (
                <div className="text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Newest cache:
                  </span>
                  <span className="ml-2 text-gray-900 dark:text-white">
                    {cacheStats.newestItem}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Clear Cache Button */}
          {cacheStats.totalItems > 0 && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleClearCache}
                disabled={isClearing}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors"
              >
                {isClearing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {isClearing ? "Clearing..." : "Clear Offline Data"}
              </button>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Offline Tips
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Your data is automatically cached when online</li>
                <li>• Changes made offline will sync when you reconnect</li>
                <li>• Check your internet connection settings</li>
                <li>• Try moving to a different location for better signal</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
