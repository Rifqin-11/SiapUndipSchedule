"use client";

import React from "react";
import { BookOpen, Info, Palette, Upload, History } from "lucide-react";
import Link from "next/link";
import NotificationManager from "@/components/NotificationManager";
import SettingsPageSkeleton from "@/components/SettingsPageSkeleton";
import { useSimulatedLoading } from "@/hooks/useLoadingState";

const SettingsPage = () => {
  const loading = useSimulatedLoading(1200); // Simulate 1.2 seconds loading

  const settingsItems = [
    {
      icon: BookOpen,
      title: "Manage Subjects",
      description: "Add, edit, and delete subjects",
      href: "/settings/manage-subjects",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Upload,
      title: "Upload IRS",
      description: "Import schedule from IRS file",
      href: "/settings/upload-krs",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      icon: History,
      title: "Attendance History",
      description: "View QR code scan history",
      href: "/settings/attendance-history",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      icon: Palette,
      title: "Appearance",
      description: "Theme, colors, and personalization",
      href: "/settings/appearance",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: Info,
      title: "About App",
      description: "App information and help",
      href: "/settings/about",
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    },
  ];

  if (loading) {
    return <SettingsPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              ⚙️
            </div>
            <h1 className="text-2xl font-bold mb-2">Settings</h1>
            <p className="text-blue-100">Manage your app and preferences</p>
          </div>
        </div>

        {/* Notification Manager */}
        <div className="mb-6">
          <NotificationManager />
        </div>

        {/* Settings Items */}
        <div className="space-y-3">
          {settingsItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={index}
                href={item.href}
                className="block p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-3 rounded-xl ${item.bgColor} dark:bg-gray-700`}
                  >
                    <IconComponent
                      className={`w-6 h-6 ${item.color} dark:text-gray-300`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.description}
                    </p>
                  </div>
                  <div className="text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
