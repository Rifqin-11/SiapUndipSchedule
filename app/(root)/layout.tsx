"use client";

import React, { ReactNode } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import BottomNavbar from "@/components/BottomNavbar";
import Sidebar from "@/components/Sidebar";
import OfflineIndicator from "@/components/OfflineIndicator";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <ProtectedRoute>
      {/* Offline indicator */}
      <OfflineIndicator position="top" showConnectionInfo={true} />

      <div className="flex min-h-screen pwa-safe-area">
        {/* Sidebar for desktop */}
        <Sidebar />

        {/* Main content area */}
        <div className="flex-1 w-full lg:pl-64">
          <div className="mb-25 lg:mb-0 min-h-screen w-full">{children}</div>
        </div>

        {/* Bottom navbar for mobile */}
        <BottomNavbar />
      </div>
    </ProtectedRoute>
  );
};

export default Layout;
