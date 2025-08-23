"use client";

import { useEffect, useState } from "react";
import useClassNotifications from "@/hooks/useClassNotifications";
import { useSubjects } from "@/hooks/useSubjects";

const useAutoNotifications = () => {
  const { subjects, loading } = useSubjects();
  const { initializeNotifications } = useClassNotifications();
  const [isClient, setIsClient] = useState(false);

  // Set client-side flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Only run on client-side
    if (!isClient) return;

    // Check if browser supports notifications (iOS Safari has limited support)
    const supportsNotifications =
      typeof window !== "undefined" &&
      "Notification" in window &&
      typeof Notification.requestPermission === "function";

    if (!supportsNotifications) {
      console.log("Notifications not supported on this device/browser");
      return;
    }

    console.log("Auto notifications check:", {
      loading,
      subjectsCount: subjects.length,
      permission: Notification.permission,
      isClient,
    });

    // Only initialize when subjects are loaded and notifications are permitted
    if (!loading && subjects.length > 0) {
      if (Notification.permission === "granted") {
        try {
          console.log("Initializing notifications...");
          initializeNotifications();
        } catch (error) {
          console.warn("Failed to initialize notifications:", error);
        }
      } else {
        console.log(
          "Notification permission not granted yet. Current permission:",
          Notification.permission
        );
      }
    }
  }, [subjects, loading, initializeNotifications, isClient]);
};

export default useAutoNotifications;
