"use client";

import { useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useTasks } from "./useTasks";
import { useNotificationSettings } from "./useNotificationSettings";

interface Task {
  _id?: string;
  id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "completed";
  dueDate: string;
  dueTime?: string;
  submissionLink?: string;
  subjectId?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TaskNotification {
  taskId: string;
  title: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
  hoursUntilDue: number;
}

export const useTaskNotifications = () => {
  const tasksQuery = useTasks();
  const { settings } = useNotificationSettings();

  const tasks = tasksQuery.data || [];
  const isLoading = tasksQuery.isLoading;

  // Function to check for upcoming task deadlines
  const checkUpcomingDeadlines = useCallback(() => {
    if (!settings.assignmentReminders || isLoading || !tasks) return;

    const now = new Date();
    const upcomingTasks: TaskNotification[] = [];

    tasks.forEach((task: Task) => {
      // Skip completed tasks
      if (task.status === "completed") return;

      const dueDate = new Date(task.dueDate);
      const timeDiff = dueDate.getTime() - now.getTime();
      const hoursUntilDue = Math.floor(timeDiff / (1000 * 60 * 60));

      // Check for tasks due in exactly 24 hours (within 1 hour window) or exactly 1 hour (within 15 min window)
      const is24HourWindow = hoursUntilDue >= 23 && hoursUntilDue <= 25; // 24 hours ± 1 hour
      const is1HourWindow = hoursUntilDue >= 0.75 && hoursUntilDue <= 1.25; // 1 hour ± 15 minutes

      if (is24HourWindow || is1HourWindow) {
        // Check if we've already sent this specific notification
        const notificationKey = `task_notification_${task.id}_${
          is24HourWindow ? "24h" : "1h"
        }`;
        const lastSent = localStorage.getItem(notificationKey);
        const today = new Date().toDateString();

        // Only send if we haven't sent this specific notification today
        if (lastSent !== today) {
          upcomingTasks.push({
            taskId: task.id,
            title: task.title,
            dueDate: task.dueDate,
            priority: task.priority,
            hoursUntilDue,
          });

          // Mark this notification as sent
          localStorage.setItem(notificationKey, today);
        }
      }
    });

    return upcomingTasks;
  }, [tasks, settings.assignmentReminders, isLoading]);

  // Function to show task deadline notifications
  const showTaskNotifications = useCallback(() => {
    const upcomingTasks = checkUpcomingDeadlines();
    if (!upcomingTasks || upcomingTasks.length === 0) return;

    upcomingTasks.forEach((task) => {
      // Determine if this is 24h or 1h notification
      const is24Hour = task.hoursUntilDue >= 23 && task.hoursUntilDue <= 25;
      const is1Hour = task.hoursUntilDue >= 0.75 && task.hoursUntilDue <= 1.25;

      let timeText = "";
      let notificationTitle = "";

      if (is24Hour) {
        timeText = "24 jam lagi";
        notificationTitle = "⏰ Pengingat Tugas - 24 Jam";
      } else if (is1Hour) {
        timeText = "1 jam lagi";
        notificationTitle = "🚨 Deadline Segera - 1 Jam";
      }

      const priorityEmoji =
        task.priority === "high"
          ? "🔴"
          : task.priority === "medium"
          ? "🟡"
          : "🟢";

      // Show toast notification
      toast.warning(`${priorityEmoji} ${notificationTitle}`, {
        description: `"${task.title}" akan deadline ${timeText}`,
        duration: is1Hour ? 10000 : 6000, // Longer duration for 1-hour warning
        action: {
          label: "Lihat Tugas",
          onClick: () => {
            window.location.href = "/tasks";
          },
        },
      });

      // Show browser notification if permission granted
      if (Notification.permission === "granted") {
        new Notification(`${priorityEmoji} ${notificationTitle}`, {
          body: `"${task.title}" akan deadline ${timeText}`,
          icon: "/icon-192x192.png",
          tag: `task-${task.taskId}-${is24Hour ? "24h" : "1h"}`, // Unique tag for each notification type
          requireInteraction: is1Hour, // Require interaction for 1-hour warning
        });
      }
    });
  }, [checkUpcomingDeadlines]);

  // Function to test task notifications
  const testTaskNotification = useCallback(() => {
    if (!tasks || tasks.length === 0) {
      toast.error(
        "Tidak ada tugas untuk ditest. Tambahkan tugas terlebih dahulu."
      );
      return;
    }

    // Find first non-completed task for testing
    const testTask = tasks.find((task: Task) => task.status !== "completed");
    if (!testTask) {
      toast.error("Tidak ada tugas yang belum selesai untuk ditest.");
      return;
    }

    const priorityEmoji =
      testTask.priority === "high"
        ? "🔴"
        : testTask.priority === "medium"
        ? "🟡"
        : "🟢";

    // Show test for 24-hour notification
    setTimeout(() => {
      toast.warning(`${priorityEmoji} ⏰ Test: Pengingat Tugas - 24 Jam`, {
        description: `"${testTask.title}" akan deadline 24 jam lagi`,
        duration: 6000,
        action: {
          label: "Lihat Tugas",
          onClick: () => {
            window.location.href = "/tasks";
          },
        },
      });

      if (Notification.permission === "granted") {
        new Notification(`${priorityEmoji} ⏰ Test: Pengingat Tugas - 24 Jam`, {
          body: `"${testTask.title}" akan deadline 24 jam lagi`,
          icon: "/icon-192x192.png",
          tag: `test-task-24h-${testTask.id}`,
        });
      }
    }, 500);

    // Show test for 1-hour notification
    setTimeout(() => {
      toast.warning(`${priorityEmoji} 🚨 Test: Deadline Segera - 1 Jam`, {
        description: `"${testTask.title}" akan deadline 1 jam lagi`,
        duration: 10000,
        action: {
          label: "Lihat Tugas",
          onClick: () => {
            window.location.href = "/tasks";
          },
        },
      });

      if (Notification.permission === "granted") {
        new Notification(`${priorityEmoji} 🚨 Test: Deadline Segera - 1 Jam`, {
          body: `"${testTask.title}" akan deadline 1 jam lagi`,
          icon: "/icon-192x192.png",
          tag: `test-task-1h-${testTask.id}`,
          requireInteraction: true,
        });
      }
    }, 3000);
  }, [tasks]);

  // Function to clear notification history (useful for testing or reset)
  const clearNotificationHistory = useCallback(() => {
    if (!tasks) return;

    tasks.forEach((task: Task) => {
      localStorage.removeItem(`task_notification_${task.id}_24h`);
      localStorage.removeItem(`task_notification_${task.id}_1h`);
    });

    toast.success("Riwayat notifikasi tugas telah dibersihkan");
  }, [tasks]);

  // Check for task deadlines periodically
  useEffect(() => {
    if (!settings.assignmentReminders) return;

    // Initial check
    showTaskNotifications();

    // Set up more frequent checks (every 30 minutes) to catch precise timing
    const interval = setInterval(() => {
      showTaskNotifications();
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(interval);
  }, [settings.assignmentReminders, showTaskNotifications]);

  return {
    checkUpcomingDeadlines,
    showTaskNotifications,
    testTaskNotification,
    clearNotificationHistory,
  };
};
