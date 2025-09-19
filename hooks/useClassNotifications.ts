"use client";

import { useRef, useCallback } from "react";
import { useSubjects, Subject } from "@/hooks/useSubjects";

const useClassNotifications = () => {
  const { data: subjects = [] } = useSubjects();

  // Prevent duplicate scheduling
  const scheduledNotifications = useRef(new Set<string>());
  const lastScheduledCount = useRef(0);

  // Check if notifications are supported (better iOS compatibility)
  const isNotificationSupported = () => {
    if (typeof window === "undefined") return false;

    // iOS Safari has limited notification support
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari =
      /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

    if (isIOS && isSafari) {
      // iOS Safari supports notifications but with limitations
      console.log(
        "iOS Safari detected - notifications may have limited functionality"
      );
    }

    return (
      "Notification" in window &&
      typeof Notification.requestPermission === "function"
    );
  };

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (!isNotificationSupported()) {
      console.log("Notifications not supported on this device");
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    } catch (error) {
      console.warn("Error requesting notification permission:", error);
      return false;
    }
  }, []);

  // Create notification
  const createNotification = useCallback(
    (title: string, body: string, options?: NotificationOptions) => {
      if (!isNotificationSupported()) {
        console.log(
          "Notifications not supported, skipping notification creation"
        );
        return null;
      }

      if (Notification.permission !== "granted") {
        console.log("Notification permission not granted");
        return null;
      }

      try {
        const notification = new Notification(title, {
          body,
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          tag: "class-reminder",
          requireInteraction: false, // Changed to false for better iOS compatibility
          ...options,
        });

        // Auto close after 10 seconds
        setTimeout(() => {
          try {
            notification.close();
          } catch (error) {
            console.warn("Error closing notification:", error);
          }
        }, 10000);

        return notification;
      } catch (error) {
        console.warn("Error creating notification:", error);
        return null;
      }
    },
    []
  );

  // Calculate time until class starts (supports both recurring and date-specific subjects)
  const getTimeUntilClass = useCallback((subject: Subject): number => {
    const now = new Date();

    // For date-specific subjects
    if (subject.specificDate) {
      if (process.env.NODE_ENV === "development") {
        console.log(
          `Processing date-specific subject: ${subject.name} on ${subject.specificDate}`
        );
      }

      // Parse the specific date (YYYY-MM-DD format)
      const [year, month, day] = subject.specificDate.split("-").map(Number);

      // Parse start time (assuming format like "08:00" or "8:00 AM")
      const [time, period] = subject.startTime.split(" ");
      let [hours] = time.split(":").map(Number);
      const [, minutes] = time.split(":").map(Number);

      // Convert to 24-hour format if needed
      if (period) {
        if (period.toLowerCase() === "pm" && hours !== 12) hours += 12;
        if (period.toLowerCase() === "am" && hours === 12) hours = 0;
      }

      // Create date for the specific class
      const classDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
      const timeUntil = classDate.getTime() - now.getTime();

      if (process.env.NODE_ENV === "development") {
        console.log(
          `Date-specific subject ${
            subject.name
          }: classDate=${classDate.toISOString()}, timeUntil=${
            timeUntil / 1000 / 60
          } minutes`
        );
      }
      return timeUntil;
    }

    // For recurring subjects (legacy logic)
    const currentDay = now.toLocaleDateString("en-US", { weekday: "long" });

    // Parse start time (assuming format like "08:00" or "8:00 AM")
    const [time, period] = subject.startTime.split(" ");
    let [hours] = time.split(":").map(Number);
    const [, minutes] = time.split(":").map(Number);

    // Convert to 24-hour format if needed
    if (period) {
      if (period.toLowerCase() === "pm" && hours !== 12) hours += 12;
      if (period.toLowerCase() === "am" && hours === 12) hours = 0;
    }

    // Create date for the class
    const classDate = new Date(now);
    classDate.setHours(hours, minutes, 0, 0);

    // If class is today but already passed, schedule for next week
    if (subject.day === currentDay && classDate <= now) {
      classDate.setDate(classDate.getDate() + 7);
    }
    // If class is not today, find the next occurrence
    else if (subject.day !== currentDay) {
      const daysOfWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const currentDayIndex = now.getDay();
      const classDayIndex = daysOfWeek.indexOf(subject.day);

      if (classDayIndex === -1) return -1; // Invalid day

      let daysUntilClass = classDayIndex - currentDayIndex;
      if (daysUntilClass <= 0) daysUntilClass += 7;

      classDate.setDate(classDate.getDate() + daysUntilClass);
    }

    const timeUntil = classDate.getTime() - now.getTime();
    if (process.env.NODE_ENV === "development") {
      console.log(
        `Recurring subject ${
          subject.name
        }: classDate=${classDate.toISOString()}, timeUntil=${
          timeUntil / 1000 / 60
        } minutes`
      );
    }
    return timeUntil;
  }, []);

  // Schedule notification
  const scheduleNotification = useCallback(
    (subject: Subject) => {
      console.log(`Attempting to schedule notification for: ${subject.name}`);

      const timeUntilClass = getTimeUntilClass(subject);

      if (timeUntilClass <= 0) {
        console.log(
          `Subject ${subject.name} is in the past, skipping notification`
        );
        return;
      }

      // Schedule notification 15 minutes before class
      const notificationTime = timeUntilClass - 15 * 60 * 1000; // 15 minutes in milliseconds

      if (notificationTime > 0) {
        console.log(
          `Scheduling 15-min notification for ${subject.name} in ${
            notificationTime / 1000 / 60
          } minutes`
        );

        setTimeout(() => {
          console.log(`Triggering 15-min notification for ${subject.name}`);
          createNotification(
            "Class Reminder 📚",
            `${subject.name} will start in 15 minutes at ${subject.room}`,
            {
              data: {
                subjectId: subject.id,
                type: "class-reminder",
              },
            }
          );
        }, notificationTime);
      } else {
        console.log(`15-min notification time has passed for ${subject.name}`);
      }

      // Schedule notification 5 minutes before class
      const urgentNotificationTime = timeUntilClass - 5 * 60 * 1000; // 5 minutes in milliseconds

      if (urgentNotificationTime > 0) {
        console.log(
          `Scheduling 5-min notification for ${subject.name} in ${
            urgentNotificationTime / 1000 / 60
          } minutes`
        );

        setTimeout(() => {
          console.log(`Triggering 5-min notification for ${subject.name}`);
          createNotification(
            "Class Starting Soon! 🚨",
            `${subject.name} starts in 5 minutes at ${subject.room}. Get ready!`,
            {
              data: {
                subjectId: subject.id,
                type: "urgent-reminder",
              },
            }
          );
        }, urgentNotificationTime);
      } else {
        console.log(`5-min notification time has passed for ${subject.name}`);
      }
    },
    [getTimeUntilClass, createNotification]
  );

  // Initialize notifications for all subjects
  const initializeNotifications = useCallback(async () => {
    // Skip if already scheduled for current subjects
    if (
      lastScheduledCount.current === subjects.length &&
      scheduledNotifications.current.size > 0
    ) {
      if (process.env.NODE_ENV === "development") {
        console.log("Notifications already scheduled for current subjects");
      }
      return;
    }

    // Clear previous notifications if subjects changed
    if (lastScheduledCount.current !== subjects.length) {
      if (process.env.NODE_ENV === "development") {
        console.log("Subjects changed, clearing previous notifications");
      }
      scheduledNotifications.current.clear();
    }

    const hasPermission = await requestNotificationPermission();

    if (!hasPermission) {
      console.log("Notification permission denied");
      return;
    }

    // Schedule notifications for all subjects that have a valid schedule
    const validSubjects = subjects.filter((subject) => {
      const subjectKey = `${subject.name}-${subject.day}-${subject.startTime}`;

      if (scheduledNotifications.current.has(subjectKey)) {
        return false; // Already scheduled
      }

      // For date-specific subjects
      if (subject.specificDate) {
        const hasValidSchedule =
          subject.specificDate &&
          subject.startTime &&
          typeof subject.startTime === "string" &&
          subject.startTime.trim() !== "";

        if (!hasValidSchedule) {
          if (process.env.NODE_ENV === "development") {
            console.log(
              `Skipping notification for date-specific subject ${subject.name} - no valid schedule`
            );
          }
          return false;
        }

        if (process.env.NODE_ENV === "development") {
          console.log(
            `Valid date-specific subject found: ${subject.name} on ${subject.specificDate}`
          );
        }
        return true;
      }

      // For recurring subjects
      const hasValidSchedule =
        subject.day &&
        typeof subject.day === "string" &&
        subject.day.trim() !== "" &&
        subject.startTime &&
        typeof subject.startTime === "string" &&
        subject.startTime.trim() !== "";

      if (!hasValidSchedule) {
        if (process.env.NODE_ENV === "development") {
          console.log(
            `Skipping notification for recurring subject ${subject.name} - no valid schedule`
          );
        }
        return false;
      }

      if (process.env.NODE_ENV === "development") {
        console.log(
          `Valid recurring subject found: ${subject.name} on ${subject.day}`
        );
      }
      return true;
    });

    console.log(
      `Setting up notifications for ${validSubjects.length} scheduled subjects`
    );

    // Schedule notifications and track them
    for (const subject of validSubjects) {
      const subjectKey = `${subject.name}-${subject.day}-${subject.startTime}`;

      try {
        scheduleNotification(subject);
        scheduledNotifications.current.add(subjectKey);
      } catch (error) {
        console.error(
          `Failed to schedule notification for ${subject.name}:`,
          error
        );
      }
    }

    lastScheduledCount.current = subjects.length;
  }, [subjects, requestNotificationPermission, scheduleNotification]);

  // Test notification (for development)
  const testNotification = () => {
    createNotification(
      "Test Notification 🧪",
      "This is a test notification to verify the system is working!"
    );
  };

  return {
    requestNotificationPermission,
    createNotification,
    scheduleNotification,
    initializeNotifications,
    testNotification,
  };
};

export default useClassNotifications;
