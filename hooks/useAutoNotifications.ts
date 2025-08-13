"use client";

import { useEffect } from "react";
import useClassNotifications from "@/hooks/useClassNotifications";
import { useSubjects } from "@/hooks/useSubjects";

const useAutoNotifications = () => {
  const { subjects, loading } = useSubjects();
  const { initializeNotifications } = useClassNotifications();

  useEffect(() => {
    // Only initialize when subjects are loaded and notifications are permitted
    if (!loading && subjects.length > 0 && "Notification" in window) {
      if (Notification.permission === "granted") {
        initializeNotifications();
      }
    }
  }, [subjects, loading, initializeNotifications]);

  // Re-initialize when subjects change (new subjects added, etc.)
  useEffect(() => {
    if (Notification.permission === "granted" && subjects.length > 0) {
      // Small delay to avoid too frequent re-initialization
      const timeoutId = setTimeout(() => {
        initializeNotifications();
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [subjects, initializeNotifications]);
};

export default useAutoNotifications;
