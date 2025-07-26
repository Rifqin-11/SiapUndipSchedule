"use client";

import React, { useState, useEffect } from "react";
import { Palette, Monitor, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useAppearanceSettings } from "@/hooks/useAppearanceSettings";
import BackButton from "@/components/Back-Button";

const AppearancePage = () => {
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings, isLoaded } = useAppearanceSettings();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const themes = [
    { id: "light", name: "Terang", icon: Sun, desc: "Tema terang" },
    { id: "dark", name: "Gelap", icon: Moon, desc: "Tema gelap" },
    { id: "system", name: "Sistem", icon: Monitor, desc: "Ikuti sistem" },
  ];

  const colors = [
    { id: "blue", name: "Biru", color: "bg-blue-500" },
    { id: "purple", name: "Ungu", color: "bg-purple-500" },
    { id: "green", name: "Hijau", color: "bg-green-500" },
    { id: "red", name: "Merah", color: "bg-red-500" },
  ];

  const fontSizes = [
    { id: "small", name: "Kecil" },
    { id: "medium", name: "Sedang" },
    { id: "large", name: "Besar" },
  ];

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    toast.success(
      `Tema berhasil diubah ke ${themes.find((t) => t.id === newTheme)?.name}`
    );
  };

  const handleSaveSettings = () => {
    toast.success("Pengaturan tampilan berhasil disimpan!");
  };

  if (!mounted || !isLoaded) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <section className="flex flex-row gap-2 items-center pt-4 pb-2 mx-5">
        <BackButton />
        <div className="flex flex-row justify-center items-center w-full">
          <div className="flex flex-col gap-0.5 justify-center text-center">
            <div className="flex items-center justify-center gap-2">
              <Palette className="w-6 h-6 text-purple-600" />
              <h1 className="font-bold text-xl text-gray-900 dark:text-white">
                Tampilan
              </h1>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Theme Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tema
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
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
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
                        : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {themeOption.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {themeOption.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Color Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Warna Utama
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {colors.map((color) => (
              <button
                key={color.id}
                onClick={() => updateSettings({ primaryColor: color.id })}
                className={`p-3 rounded-xl border-2 transition-all ${
                  settings.primaryColor === color.id
                    ? "border-gray-400 dark:border-gray-500"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full mx-auto mb-2 ${color.color}`}
                />
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {color.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Font Size */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Ukuran Font
          </h2>
          <div className="space-y-3">
            {fontSizes.map((size) => (
              <button
                key={size.id}
                onClick={() => updateSettings({ fontSize: size.id })}
                className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                  settings.fontSize === size.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300"
                }`}
              >
                <div
                  className={`font-medium ${
                    settings.fontSize === size.id
                      ? "text-blue-600"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {size.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Compact Mode */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Mode Kompak
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tampilan lebih padat untuk layar kecil
              </p>
            </div>
            <button
              onClick={() =>
                updateSettings({ compactMode: !settings.compactMode })
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.compactMode
                  ? "bg-blue-600"
                  : "bg-gray-300 dark:bg-gray-600"
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
          Simpan Pengaturan
        </button>
      </div>
    </div>
  );
};

export default AppearancePage;
