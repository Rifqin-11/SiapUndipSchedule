"use client";

import React from "react";
import { BookOpen, Info, Palette, History } from "lucide-react";
import Link from "next/link";
import SettingsPageSkeleton from "@/components/settings/SettingsPageSkeleton";
import { useSimulatedLoading } from "@/hooks/useLoadingState";

const SettingsPage = () => {
  const loading = useSimulatedLoading(500); // Simulate 1.2 seconds loading

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
    <div className="min-h-screen bg-background p-6 hidden xl:block">
      <div className="max-full mx-auto">
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

        {/* Settings Items */}
        <div className="space-y-3">
          {settingsItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={index}
                href={item.href}
                className="block p-4 bg-card rounded-xl shadow-sm border border-border hover:shadow-md hover:border-muted-foreground transition-all duration-200 group"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-3 rounded-xl ${item.bgColor} dark:bg-secondary`}
                  >
                    <IconComponent
                      className={`w-6 h-6 ${item.color} dark:text-gray-300`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-card-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <div className="text-muted-foreground group-hover:text-muted-foreground transition-colors">
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
