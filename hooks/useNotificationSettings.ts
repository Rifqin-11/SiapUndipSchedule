"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

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
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
  const updateSetting = useCallback(<K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K]
  ) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Toggle a boolean setting
  const toggleSetting = useCallback((key: keyof NotificationSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key] as any
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
        message: "Pengaturan notifikasi berhasil disimpan!"
      };
    } catch (error) {
      console.error("Error saving notification settings:", error);
      return {
        success: false,
        message: "Gagal menyimpan pengaturan. Silakan coba lagi."
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
      activeFeatures.push(`Pengingat kelas ${settings.beforeClass} menit sebelumnya`);
    }
    
    if (settings.assignmentReminders) {
      activeFeatures.push("Pengingat tugas");
    }
    
    if (settings.weekendReminders) {
      activeFeatures.push("Pengingat weekend");
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
      hasActiveReminders: settings.classReminders || settings.assignmentReminders
    };
  }, [settings]);

  return {
    settings,
    hasUnsavedChanges,
    isLoading,
    updateSetting,
    toggleSetting,
    saveSettings,
    resetSettings,
    getSettingsInfo,
  };
};
