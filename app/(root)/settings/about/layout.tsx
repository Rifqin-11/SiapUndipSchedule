import SettingsHeader from "@/components/settings/SettingsHeader";
import SimplePageHeader from "@/components/SimplePageHeader";
import FixedHeaderLayout from "@/components/FixedHeaderLayout";
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
        title="About"
        icon="Info" // ← String
        iconColor="text-purple-600"
      />

      <FixedHeaderLayout extraPadding="pt-6 pb-12">
        {children}
      </FixedHeaderLayout>
    </div>
  );
}
