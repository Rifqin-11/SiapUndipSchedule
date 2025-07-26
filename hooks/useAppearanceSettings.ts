"use client";

import { useState, useEffect } from "react";

interface AppearanceSettings {
  primaryColor: string;
  fontSize: string;
  compactMode: boolean;
}

const defaultSettings: AppearanceSettings = {
  primaryColor: "blue",
  fontSize: "medium",
  compactMode: false,
};

export const useAppearanceSettings = () => {
  const [settings, setSettings] = useState<AppearanceSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("appearance-settings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error("Failed to parse appearance settings:", error);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save settings to localStorage whenever they change
  const updateSettings = (newSettings: Partial<AppearanceSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem(
      "appearance-settings",
      JSON.stringify(updatedSettings)
    );
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem("appearance-settings");
  };

  return {
    settings,
    updateSettings,
    resetSettings,
    isLoaded,
  };
};
