"use client";

import React, { useState, useEffect } from "react";
import { Bell, Clock, Volume2, Smartphone, BellOff } from "lucide-react";
import BackButton from "@/components/Back-Button";
import useClassNotifications from "@/hooks/useClassNotifications";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const NotificationsPage = () => {
  const [settings, setSettings] = useState({
    classReminders: true,
    beforeClass: 15,
    soundEnabled: true,
    vibrationEnabled: true,
    weekendReminders: false,
    assignmentReminders: true,
  });

  // States for notification permission
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isClient, setIsClient] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  const {
    requestNotificationPermission,
    initializeNotifications,
    testNotification,
  } = useClassNotifications();

  useEffect(() => {
    // Mark as client-side
    setIsClient(true);

    // Check if notifications are supported in this environment
    try {
      if (typeof window !== "undefined") {
        const supported =
          "Notification" in window &&
          typeof Notification.requestPermission === "function";

        setIsSupported(supported);

        if (supported) {
          setPermission(Notification.permission);
          setNotificationsEnabled(Notification.permission === "granted");
        }
      }
    } catch (error) {
      console.warn("Error checking notification support:", error);
      setIsSupported(false);
    }
  }, []);

  const handleEnableNotifications = async () => {
    if (!isSupported) {
      toast.error("Notifications are not supported on this device/browser.");
      return;
    }

    try {
      const granted = await requestNotificationPermission();

      if (granted) {
        setNotificationsEnabled(true);
        setPermission("granted");
        await initializeNotifications();
        toast.success("Notifications enabled! You'll receive class reminders.");
      } else {
        toast.error(
          "Notification permission denied. Please enable in browser settings."
        );
      }
    } catch (error) {
      console.error("Error enabling notifications:", error);
      toast.error("Failed to enable notifications.");
    }
  };

  const handleDisableNotifications = () => {
    setNotificationsEnabled(false);
    toast.info("Notifications disabled. You won't receive class reminders.");
  };

  const handleTestNotification = () => {
    if (notificationsEnabled) {
      testNotification();
      toast.success("Test notification sent!");
    } else {
      toast.error("Please enable notifications first.");
    }
  };

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

      {/* Notification Permission & Test */}
      <div className="max-w-2xl mx-auto px-6 mb-6">
        {isClient && isSupported && (
          <div className="bg-white dark:bg-card rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {notificationsEnabled ? (
                  <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                ) : (
                  <BellOff className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Class Notifications
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {notificationsEnabled
                      ? "You'll receive reminders 15 & 5 minutes before class"
                      : "Get notified before your classes start"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {!notificationsEnabled ? (
                <Button
                  onClick={handleEnableNotifications}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Enable Notifications
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleDisableNotifications}
                    variant="outline"
                    size="sm"
                  >
                    <BellOff className="w-4 h-4 mr-2" />
                    Disable
                  </Button>
                  <Button
                    onClick={handleTestNotification}
                    variant="outline"
                    size="sm"
                  >
                    Test Notification
                  </Button>
                </>
              )}
            </div>

            {permission === "denied" && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">
                  Notifications are blocked. To enable them:
                  <br />
                  1. Click the lock icon in your browser&apos;s address bar
                  <br />
                  2. Set notifications to &quot;Allow&quot;
                  <br />
                  3. Refresh the page
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Class Reminders */}
        <div className="bg-white dark:bg-card rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
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
        <div className="bg-white dark:bg-card rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
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
        <div className="bg-white dark:bg-card rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
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
