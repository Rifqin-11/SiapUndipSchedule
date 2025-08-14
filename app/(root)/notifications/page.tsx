"use client";

import React, { useState } from "react";
import { Bell, Clock, Volume2, Smartphone } from "lucide-react";
import BackButton from "@/components/Back-Button";

const NotificationsPage = () => {
  const [settings, setSettings] = useState({
    classReminders: true,
    beforeClass: 15,
    soundEnabled: true,
    vibrationEnabled: true,
    weekendReminders: false,
    assignmentReminders: true,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleTimeChange = (value: number) => {
    setSettings((prev) => ({
      ...prev,
      beforeClass: value,
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="flex flex-row gap-2 items-center pt-4 pb-2 mx-5">
        <BackButton />
        <div className="flex flex-row justify-center items-center w-full">
          <div className="flex flex-col gap-0.5 justify-center text-center">
            <div className="flex items-center justify-center gap-2">
              <Bell className="w-6 h-6 text-yellow-600" />
              <h1 className="font-bold text-xl text-gray-900 dark:text-white">
                Notifikasi
              </h1>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Class Reminders */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Pengingat Kelas
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Aktifkan Pengingat
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Dapatkan notifikasi sebelum kelas dimulai
                </p>
              </div>
              <button
                onClick={() => handleToggle("classReminders")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.classReminders
                    ? "bg-blue-600"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.classReminders ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {settings.classReminders && (
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Waktu Pengingat
                </h3>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <select
                    value={settings.beforeClass}
                    onChange={(e) => handleTimeChange(Number(e.target.value))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value={5}>5 menit sebelum</option>
                    <option value={10}>10 menit sebelum</option>
                    <option value={15}>15 menit sebelum</option>
                    <option value={30}>30 menit sebelum</option>
                    <option value={60}>1 jam sebelum</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sound & Vibration */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Suara & Getaran
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-gray-500" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Suara Notifikasi
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Putar suara saat notifikasi muncul
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleToggle("soundEnabled")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.soundEnabled
                    ? "bg-blue-600"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.soundEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-gray-500" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Getaran
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Aktifkan getaran untuk notifikasi
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleToggle("vibrationEnabled")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.vibrationEnabled
                    ? "bg-blue-600"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.vibrationEnabled
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Other Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Pengaturan Lain
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Pengingat Weekend
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Dapatkan notifikasi di akhir pekan
                </p>
              </div>
              <button
                onClick={() => handleToggle("weekendReminders")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.weekendReminders
                    ? "bg-blue-600"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.weekendReminders
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Pengingat Tugas
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Notifikasi untuk deadline tugas
                </p>
              </div>
              <button
                onClick={() => handleToggle("assignmentReminders")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.assignmentReminders
                    ? "bg-blue-600"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.assignmentReminders
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button className="w-full p-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
          Simpan Pengaturan
        </button>
      </div>
    </div>
  );
};

export default NotificationsPage;
