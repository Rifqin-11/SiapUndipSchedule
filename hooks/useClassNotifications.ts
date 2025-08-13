"use client";

import { useSubjects, Subject } from "@/hooks/useSubjects";

const useClassNotifications = () => {
  const { subjects } = useSubjects();

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
  const requestNotificationPermission = async () => {
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
  };

  // Create notification
  const createNotification = (
    title: string,
    body: string,
    options?: NotificationOptions
  ) => {
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
  };

  // Calculate time until class starts
  const getTimeUntilClass = (day: string, startTime: string): number => {
    const now = new Date();
    const currentDay = now.toLocaleDateString("en-US", { weekday: "long" });

    // Parse start time (assuming format like "08:00" or "8:00 AM")
    const [time, period] = startTime.split(" ");
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
    if (day === currentDay && classDate <= now) {
      classDate.setDate(classDate.getDate() + 7);
    }
    // If class is not today, find the next occurrence
    else if (day !== currentDay) {
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
      const classDayIndex = daysOfWeek.indexOf(day);

      if (classDayIndex === -1) return -1; // Invalid day

      let daysUntilClass = classDayIndex - currentDayIndex;
      if (daysUntilClass <= 0) daysUntilClass += 7;

      classDate.setDate(classDate.getDate() + daysUntilClass);
    }

    return classDate.getTime() - now.getTime();
  };

  // Schedule notification
  const scheduleNotification = (subject: Subject) => {
    const timeUntilClass = getTimeUntilClass(subject.day, subject.startTime);

    if (timeUntilClass <= 0) return;

    // Schedule notification 15 minutes before class
    const notificationTime = timeUntilClass - 15 * 60 * 1000; // 15 minutes in milliseconds

    if (notificationTime > 0) {
      setTimeout(() => {
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

      console.log(
        `Notification scheduled for ${subject.name} in ${
          notificationTime / 1000 / 60
        } minutes`
      );
    }

    // Schedule notification 5 minutes before class
    const urgentNotificationTime = timeUntilClass - 5 * 60 * 1000; // 5 minutes in milliseconds

    if (urgentNotificationTime > 0) {
      setTimeout(() => {
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
    }
  };

  // Initialize notifications for all subjects
  const initializeNotifications = async () => {
    const hasPermission = await requestNotificationPermission();

    if (!hasPermission) {
      console.log("Notification permission denied");
      return;
    }

    // Clear existing timeouts (in a real app, you'd want to track these)
    // Schedule notifications for all subjects that have a valid schedule
    const scheduledSubjects = subjects.filter((subject) => {
      const hasValidSchedule =
        subject.day &&
        typeof subject.day === "string" &&
        subject.day.trim() !== "" &&
        subject.startTime &&
        typeof subject.startTime === "string" &&
        subject.startTime.trim() !== "";

      if (!hasValidSchedule) {
        console.log(
          `Skipping notification for ${subject.name} - no valid schedule`
        );
        return false;
      }

      return true;
    });

    console.log(
      `Setting up notifications for ${scheduledSubjects.length} scheduled subjects`
    );
    scheduledSubjects.forEach((subject) => {
      scheduleNotification(subject);
    });
  };

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
