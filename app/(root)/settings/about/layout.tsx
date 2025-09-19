import SettingsHeader from "@/components/settings/SettingsHeader";
import SimplePageHeader from "@/components/SimplePageHeader";
import { Info } from "lucide-react";
import React from "react";

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <SimplePageHeader
        title="Settings"
        icon="Info" // ← String
        iconColor="text-purple-600"
      />

      <div className="pt-6 pb-12">{children}</div>
    </div>
  );
}
