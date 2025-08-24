import SettingsHeader from "@/components/SettingsHeader";
import { BookOpen } from "lucide-react";
import React, { ReactNode } from "react";

const layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-background">
      <SettingsHeader
        title="Manage Subjects"
        description="Add, edit, and delete your subjects"
        icon={<BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
      />
      <div className="pt-6 pb-12">{children}</div>
    </div>
  );
};

export default layout;
