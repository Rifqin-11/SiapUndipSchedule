import SettingsHeader from "@/components/SettingsHeader";
import { Palette } from "lucide-react";
import React from "react";

export default function AppearanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <SettingsHeader
        title="Appearance"
        description="Theme, colors, and personalization"
        icon={
          <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        }
      />

      <div className="pt-6 pb-12">{children}</div>
    </div>
  );
}
