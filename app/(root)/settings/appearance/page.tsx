"use client";

import React, { useState, useEffect } from "react";
import { Monitor, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useAppearanceSettings } from "@/hooks/useAppearanceSettings";

const AppearancePage = () => {
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings, isLoaded } = useAppearanceSettings();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const themes = [
    { id: "light", name: "Light", icon: Sun, desc: "Light theme" },
    { id: "dark", name: "Dark", icon: Moon, desc: "Dark theme" },
    { id: "system", name: "System", icon: Monitor, desc: "Follow system" },
  ];

  const colors = [
    { id: "blue", name: "Blue", color: "bg-blue-500" },
    { id: "purple", name: "Purple", color: "bg-purple-500" },
    { id: "green", name: "Green", color: "bg-green-500" },
    { id: "red", name: "Red", color: "bg-red-500" },
  ];

  const fontSizes = [
    { id: "small", name: "Small" },
    { id: "medium", name: "Medium" },
    { id: "large", name: "Large" },
  ];

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme as "light" | "dark" | "system");
    console.log(
      `Theme successfully changed to ${
        themes.find((t) => t.id === newTheme)?.name
      }`
    );
  };

  const handleSaveSettings = () => {
    console.log("Appearance settings saved successfully!");
  };

  if (!mounted || !isLoaded) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Theme Selection */}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
        <h2 className="text-lg font-semibold text-card-foreground mb-4">
          Theme
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {themes.map((themeOption) => {
            const IconComponent = themeOption.icon;
            return (
              <button
                key={themeOption.id}
                onClick={() => handleThemeChange(themeOption.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  theme === themeOption.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-border hover:border-muted-foreground"
                }`}
              >
                <IconComponent
                  className={`w-6 h-6 mx-auto mb-2 ${
                    theme === themeOption.id
                      ? "text-blue-600"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                />
                <div
                  className={`font-medium ${
                    theme === themeOption.id
                      ? "text-blue-600"
                      : "text-card-foreground"
                  }`}
                >
                  {themeOption.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {themeOption.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Selection */}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
        <h2 className="text-lg font-semibold text-card-foreground mb-4">
          Primary Color
        </h2>
        <div className="grid grid-cols-4 gap-3">
          {colors.map((color) => (
            <button
              key={color.id}
              onClick={() => updateSettings({ primaryColor: color.id })}
              className={`p-3 rounded-xl border-2 transition-all ${
                settings.primaryColor === color.id
                  ? "border-muted-foreground"
                  : "border-border hover:border-muted-foreground"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full mx-auto mb-2 ${color.color}`}
              />
              <div className="text-sm font-medium text-card-foreground">
                {color.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
        <h2 className="text-lg font-semibold text-card-foreground mb-4">
          Font Size
        </h2>
        <div className="space-y-3">
          {fontSizes.map((size) => (
            <button
              key={size.id}
              onClick={() => updateSettings({ fontSize: size.id })}
              className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                settings.fontSize === size.id
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-border hover:border-muted-foreground"
              }`}
            >
              <div
                className={`font-medium ${
                  settings.fontSize === size.id
                    ? "text-blue-600"
                    : "text-card-foreground"
                }`}
              >
                {size.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Compact Mode */}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-card-foreground">Compact Mode</h3>
            <p className="text-sm text-muted-foreground">
              Denser layout for small screens
            </p>
          </div>
          <button
            onClick={() =>
              updateSettings({ compactMode: !settings.compactMode })
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.compactMode ? "bg-blue-600" : "bg-muted"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.compactMode ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSaveSettings}
        className="w-full p-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
      >
        Save Settings
      </button>
    </div>
  );
};

export default AppearancePage;
