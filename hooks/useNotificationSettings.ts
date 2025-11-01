"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useWeeklyStats } from "./useWeeklyStats";

export interface NotificationSettings {
  classReminders: boolean;
  beforeClass: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  weekendReminders: boolean;
  assignmentReminders: boolean;
}

const STORAGE_KEY = "notification_settings";

const defaultSettings: NotificationSettings = {
  classReminders: true,
  beforeClass: 15,
  soundEnabled: true,
  vibrationEnabled: true,
  weekendReminders: false,
  assignmentReminders: true,
};

export const useNotificationSettings = () => {
  const [settings, setSettings] =
    useState<NotificationSettings>(defaultSettings);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { generateWeeklySummary, weeklyStats } = useWeeklyStats();

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
        console.log("Loaded notification settings:", parsed);
      }
    } catch (error) {
      console.error("Error loading notification settings:", error);
      toast.error("Gagal memuat pengaturan notifikasi");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update a specific setting
  const updateSetting = useCallback(
    <K extends keyof NotificationSettings>(
      key: K,
      value: NotificationSettings[K]
    ) => {
      setSettings((prev) => ({
        ...prev,
        [key]: value,
      }));
      setHasUnsavedChanges(true);
    },
    []
  );

  // Toggle a boolean setting
  const toggleSetting = useCallback((key: keyof NotificationSettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key] as any,
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Save settings to localStorage
  const saveSettings = useCallback(async () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setHasUnsavedChanges(false);

      return {
        success: true,
        message: "Pengaturan notifikasi berhasil disimpan!",
      };
    } catch (error) {
      console.error("Error saving notification settings:", error);
      return {
        success: false,
        message: "Gagal menyimpan pengaturan. Silakan coba lagi.",
      };
    }
  }, [settings]);

  // Reset settings to default
  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    setHasUnsavedChanges(true);
  }, []);

  // Get settings status info
  const getSettingsInfo = useCallback(() => {
    const activeFeatures = [];

    if (settings.classReminders) {
      activeFeatures.push(
        `Pengingat kelas ${settings.beforeClass} menit sebelumnya`
      );
    }

    if (settings.assignmentReminders) {
      activeFeatures.push("Pengingat tugas");
    }

    if (settings.weekendReminders) {
      activeFeatures.push("Ringkasan mingguan weekend");
    }

    if (settings.soundEnabled) {
      activeFeatures.push("Suara notifikasi");
    }

    if (settings.vibrationEnabled) {
      activeFeatures.push("Getaran");
    }

    return {
      activeFeatures,
      totalActive: activeFeatures.length,
      hasActiveReminders:
        settings.classReminders ||
        settings.assignmentReminders ||
        settings.weekendReminders,
    };
  }, [settings]);

  // Function untuk mendapatkan weekend summary jika fitur aktif
  const getWeekendSummary = useCallback(() => {
    if (!settings.weekendReminders) return null;
    return generateWeeklySummary();
  }, [settings.weekendReminders, generateWeeklySummary]);

  // Function untuk show weekend notification
  const showWeekendNotification = useCallback(() => {
    if (!settings.weekendReminders) return;

    const summary = generateWeeklySummary();
    if (!summary) return;

    // Check if it's weekend (Saturday or Sunday)
    const today = new Date();
    const dayOfWeek = today.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // 0 = Sunday, 6 = Saturday

    if (isWeekend) {
      // Show toast notification
      toast.success(summary.title, {
        description: summary.message,
        duration: 8000, // 8 seconds
        action: {
          label: "Lihat Detail",
          onClick: () => {
            console.log("Weekly stats details:", weeklyStats);
            // You could open a modal or navigate to a detailed view here
          },
        },
      });

      // Optional: Show browser notification if permission granted
      if (Notification.permission === "granted") {
        new Notification(summary.title, {
          body: summary.message,
          icon: "/icon-192x192.png", // Use your app icon
        });
      }
    }
  }, [settings.weekendReminders, generateWeeklySummary, weeklyStats]); // Restore minimal dependencies

  // Function untuk testing weekend notification (bypasses restrictions)
  const testWeekendNotification = useCallback(() => {
    const summary = generateWeeklySummary();
    if (!summary) {
      toast.error(
        "Tidak dapat menghasilkan ringkasan mingguan. Pastikan ada data mata kuliah dan tugas."
      );
      return;
    }

    // Show toast notification (bypass weekend and setting checks for testing)
    toast.success(summary.title, {
      description: summary.message,
      duration: 8000, // 8 seconds
      action: {
        label: "Lihat Detail",
        onClick: () => {
          console.log("Weekly stats details:", weeklyStats);
          // You could open a modal or navigate to a detailed view here
        },
      },
    });

    // Optional: Show browser notification if permission granted
    if (Notification.permission === "granted") {
      new Notification(summary.title, {
        body: summary.message,
        icon: "/icon-192x192.png", // Use your app icon
      });
    }
  }, [generateWeeklySummary, weeklyStats]); // Restore minimal dependencies

  // Check for weekend and show notification
  useEffect(() => {
    if (settings.weekendReminders && !isLoading) {
      // Check if we should show weekend notification
      const lastShownKey = "last_weekend_notification";
      const lastShown = localStorage.getItem(lastShownKey);
      const today = new Date().toDateString();

      // Only show once per day and only on weekends
      const dayOfWeek = new Date().getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // 0 = Sunday, 6 = Saturday

      if (lastShown !== today && isWeekend) {
        const timeoutId = setTimeout(() => {
          showWeekendNotification();
          localStorage.setItem(lastShownKey, today);
        }, 2000); // Delay 2 seconds after page load

        return () => clearTimeout(timeoutId);
      }
    }
  }, [settings.weekendReminders, isLoading, showWeekendNotification]); // Add showWeekendNotification back

  return {
    settings,
    hasUnsavedChanges,
    isLoading,
    updateSetting,
    toggleSetting,
    saveSettings,
    resetSettings,
    getSettingsInfo,
    getWeekendSummary,
    showWeekendNotification,
    testWeekendNotification,
    weeklyStats,
  };
};
