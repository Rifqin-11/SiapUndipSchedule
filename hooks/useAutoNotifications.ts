"use client";

import { useEffect, useRef, useCallback } from "react";
import useClassNotifications from "@/hooks/useClassNotifications";
import { useSubjects } from "@/hooks/useSubjects";

const useAutoNotifications = (options?: { defer?: boolean }) => {
  const { data: subjects = [], isLoading: loading } = useSubjects();
  const { initializeNotifications } = useClassNotifications();

  // Prevent multiple initializations
  const isInitialized = useRef(false);
  const lastSubjectsCount = useRef(0);

  const permission =
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "denied";

  const isClient = typeof window !== "undefined";

  const checkState = {
    loading,
    subjectsCount: subjects?.length ?? 0,
    permission,
    isClient,
  };

  const initializeOnce = useCallback(async () => {
    // Only initialize if conditions are met and not already initialized
    if (
      !loading &&
      subjects &&
      subjects.length > 0 &&
      permission === "granted" &&
      isClient &&
      (!isInitialized.current || lastSubjectsCount.current !== subjects.length)
    ) {
      // Only log once per state change
      if (process.env.NODE_ENV === "development") {
        console.log("Initializing notifications...");
      }

      try {
        await initializeNotifications();
        isInitialized.current = true;
        lastSubjectsCount.current = subjects.length;
      } catch (error) {
        console.error("Failed to initialize notifications:", error);
      }
    }
  }, [
    loading,
    subjects?.length,
    permission,
    isClient,
    initializeNotifications,
  ]);

  useEffect(() => {
    // Defer initialization if requested (for performance)
    const delay = options?.defer ? 2000 : 0; // Defer by 2 seconds if requested

    const timer = setTimeout(() => {
      // Only log once per state change in development
      if (process.env.NODE_ENV === "development") {
        console.log("Auto notifications check:", {
          loading,
          subjectsCount: subjects?.length ?? 0,
          permission,
          isClient,
        });
      }

      initializeOnce();
    }, delay);

    return () => clearTimeout(timer);
  }, [
    initializeOnce,
    loading,
    subjects?.length,
    permission,
    isClient,
    options?.defer,
  ]);

  // Reset on permission change
  useEffect(() => {
    if (permission !== "granted") {
      isInitialized.current = false;
    }
  }, [permission]);

  return checkState;
};

export default useAutoNotifications;
