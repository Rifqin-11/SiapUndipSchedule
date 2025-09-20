"use client";

import { useState, useEffect } from "react";
import { Wifi, WifiOff, RefreshCw, X } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useOfflineSync } from "@/hooks/useOfflineData";
import "./ui/toast-mobile.css";

interface OfflineIndicatorProps {
  position?: "top" | "bottom";
  showConnectionInfo?: boolean;
}

export default function OfflineIndicator({
  position = "top",
  showConnectionInfo = false,
}: OfflineIndicatorProps) {
  const { isOnline, isOffline, lastOnlineAt, connectionType, effectiveType } =
    useOnlineStatus();
  const { syncInProgress } = useOfflineSync();

  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Show indicator when offline or syncing
  useEffect(() => {
    if (isDismissed) return;

    if (isOffline || syncInProgress) {
      setIsVisible(true);
    } else if (isOnline && !syncInProgress) {
      // Show briefly when coming back online, then hide
      setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    }
  }, [isOffline, syncInProgress, isOnline, isDismissed]);

  // Reset dismissed state when going offline again
  useEffect(() => {
    if (isOffline) {
      setIsDismissed(false);
    }
  }, [isOffline]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
  };

  const handleToggleDetails = () => {
    setShowDetails(!showDetails);
  };

  if (!isVisible) return null;

  const positionClasses =
    position === "top" ? "top-0 left-0 right-0" : "bottom-0 left-0 right-0";

  const getIndicatorContent = () => {
    if (syncInProgress && isOnline) {
      return {
        icon: RefreshCw,
        iconClass: "animate-spin",
        bgColor: "bg-blue-600",
        textColor: "text-white",
        message: "Syncing data...",
        detail: "Updating offline changes",
      };
    } else if (isOffline) {
      return {
        icon: WifiOff,
        iconClass: "",
        bgColor: "bg-red-600",
        textColor: "text-white",
        message: "You're offline",
        detail: lastOnlineAt
          ? `Last online: ${lastOnlineAt.toLocaleTimeString()}`
          : "No internet connection",
      };
    } else if (isOnline) {
      return {
        icon: Wifi,
        iconClass: "",
        bgColor: "bg-green-600",
        textColor: "text-white",
        message: "Back online",
        detail: connectionType
          ? `Connected via ${connectionType}`
          : "Internet connection restored",
      };
    }

    return null;
  };

  const content = getIndicatorContent();
  if (!content) return null;

  const IconComponent = content.icon;

  return (
    <div
      className={`fixed ${positionClasses} z-50 transition-all duration-300 ease-in-out`}
    >
      <div className={`${content.bgColor} ${content.textColor} shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <IconComponent className={`w-4 h-4 ${content.iconClass}`} />

              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{content.message}</span>

                {showConnectionInfo && (
                  <button
                    onClick={handleToggleDetails}
                    className="text-xs underline hover:no-underline focus:outline-none"
                  >
                    {showDetails ? "Less" : "Details"}
                  </button>
                )}
              </div>

              {showDetails && showConnectionInfo && (
                <div className="hidden sm:block text-xs opacity-75">
                  {content.detail}
                  {effectiveType && connectionType && (
                    <span className="ml-2">• Speed: {effectiveType}</span>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-black/10 rounded transition-colors focus:outline-none"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Expanded details for mobile */}
          {showDetails && showConnectionInfo && (
            <div className="sm:hidden mt-2 pt-2 border-t border-white/20 text-xs opacity-75">
              {content.detail}
              {effectiveType && connectionType && (
                <div className="mt-1">Speed: {effectiveType}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Toast-style offline indicator for less intrusive notifications
 */
export function OfflineToast() {
  const { isOnline, isOffline } = useOnlineStatus();
  const [isVisible, setIsVisible] = useState(false);
  const [toastType, setToastType] = useState<"offline" | "online">("offline");

  useEffect(() => {
    if (isOffline) {
      setToastType("offline");
      setIsVisible(true);
    } else if (isOnline && isVisible) {
      setToastType("online");
      // Hide after showing "back online" message
      setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    }
  }, [isOffline, isOnline, isVisible]);

  if (!isVisible) return null;

  const config =
    toastType === "offline"
      ? {
          icon: WifiOff,
          bgColor:
            "bg-red-100 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-200",
          message: "You're now offline",
          description: "Some features may be limited",
        }
      : {
          icon: Wifi,
          bgColor:
            "bg-green-100 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-200",
          message: "You're back online",
          description: "All features are now available",
        };

  const IconComponent = config.icon;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div
        className={`${config.bgColor} border rounded-lg shadow-lg p-4 transition-all duration-300 ease-in-out`}
      >
        <div className="flex items-start space-x-3">
          <IconComponent className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{config.message}</p>
            <p className="text-xs opacity-75 mt-1">{config.description}</p>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="flex-shrink-0 p-0.5 hover:bg-black/10 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
