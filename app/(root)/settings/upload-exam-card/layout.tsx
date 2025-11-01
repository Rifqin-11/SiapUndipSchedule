"use client";

import SettingsHeader from "@/components/settings/SettingsHeader";
import { Upload } from "lucide-react";
import React, { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-background">
      <SettingsHeader
        title="Upload Kartu UTS/UAS"
        description="Import exam schedule from exam card file"
        icon={
          <Upload className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        }
      />

      <div className="pt-6 pb-12">{children}</div>
    </div>
  );
};

export default Layout;
