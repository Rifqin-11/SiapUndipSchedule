import SimplePageHeader from "@/components/SimplePageHeader";
import FixedHeaderLayout from "@/components/FixedHeaderLayout";
import React from "react";

export default function AppearanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <SimplePageHeader
        title="Appearance"
        icon="Palette"
        iconColor="text-purple-600"
      />

      <FixedHeaderLayout extraPadding="pt-6 pb-12">
        {children}
      </FixedHeaderLayout>
    </div>
  );
}
