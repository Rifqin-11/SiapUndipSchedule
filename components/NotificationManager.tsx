"use client";

import React, { useEffect, useState } from "react";
import useClassNotifications from "@/hooks/useClassNotifications";
import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const NotificationManager = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isClient, setIsClient] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  const {
    requestNotificationPermission,
    initializeNotifications,
    testNotification,
  } = useClassNotifications();

  useEffect(() => {
    // Mark as client-side
    setIsClient(true);

    // Check if notifications are supported in this environment
    try {
      if (typeof window !== "undefined") {
        const supported =
          "Notification" in window &&
          typeof Notification.requestPermission === "function";

        setIsSupported(supported);

        if (supported) {
          setPermission(Notification.permission);
          setNotificationsEnabled(Notification.permission === "granted");
        }
      }
    } catch (error) {
      console.warn("Error checking notification support:", error);
      setIsSupported(false);
    }
  }, []);

  const handleEnableNotifications = async () => {
    if (!isSupported) {
      toast.error("Notifications are not supported on this device/browser.");
      return;
    }

    try {
      const granted = await requestNotificationPermission();

      if (granted) {
        setNotificationsEnabled(true);
        setPermission("granted");
        await initializeNotifications();
        toast.success("Notifications enabled! You'll receive class reminders.");
      } else {
        toast.error(
          "Notification permission denied. Please enable in browser settings."
        );
      }
    } catch (error) {
      console.error("Error enabling notifications:", error);
      toast.error("Failed to enable notifications.");
    }
  };

  const handleDisableNotifications = () => {
    setNotificationsEnabled(false);
    toast.info("Notifications disabled. You won't receive class reminders.");
  };

  const handleTestNotification = () => {
    if (notificationsEnabled) {
      testNotification();
      toast.success("Test notification sent!");
    } else {
      toast.error("Please enable notifications first.");
    }
  };

  // Don't render until client-side and if not supported
  if (!isClient || !isSupported) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {notificationsEnabled ? (
            <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          ) : (
            <BellOff className="w-5 h-5 text-gray-400" />
          )}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Class Notifications
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {notificationsEnabled
                ? "You'll receive reminders 15 & 5 minutes before class"
                : "Get notified before your classes start"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {!notificationsEnabled ? (
          <Button
            onClick={handleEnableNotifications}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Bell className="w-4 h-4 mr-2" />
            Enable Notifications
          </Button>
        ) : (
          <>
            <Button
              onClick={handleDisableNotifications}
              variant="outline"
              size="sm"
            >
              <BellOff className="w-4 h-4 mr-2" />
              Disable
            </Button>
            <Button
              onClick={handleTestNotification}
              variant="outline"
              size="sm"
            >
              Test Notification
            </Button>
          </>
        )}
      </div>

      {permission === "denied" && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">
            Notifications are blocked. To enable them:
            <br />
            1. Click the lock icon in your browser&apos;s address bar
            <br />
            2. Set notifications to &quot;Allow&quot;
            <br />
            3. Refresh the page
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationManager;
