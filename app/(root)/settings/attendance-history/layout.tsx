import SettingsHeader from "@/components/settings/SettingsHeader";
import { History } from "lucide-react";
import React from "react";

export default function AttendanceHistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <SettingsHeader
        title="Attendance History"
        description="View your QR code scan history"
        icon={
          <History className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        }
      />

      <div className="pt-6 pb-12">{children}</div>
    </div>
  );
}
