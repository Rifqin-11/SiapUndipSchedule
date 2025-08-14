import SettingsHeader from "@/components/SettingsHeader";
import { Info } from "lucide-react";
import React from "react";

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SettingsHeader
        title="About"
        description="App information and help"
        icon={<Info className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
      />

      <div className="pt-6 pb-12">{children}</div>
    </div>
  );
}
