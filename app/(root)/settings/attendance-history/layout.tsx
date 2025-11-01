
import SimplePageHeader from "@/components/SimplePageHeader";
import React from "react";

export default function AttendanceHistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <SimplePageHeader
        title="Attendance History"
        icon="History"
        iconColor="text-emerald-600"
      />
      <div className="pb-12">{children}</div>
    </div>
  );
}
