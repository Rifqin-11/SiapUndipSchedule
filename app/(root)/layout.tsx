"use client";

import React, { ReactNode } from "react";
import dynamic from "next/dynamic";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";

// Critical components - load immediately
import BottomNavbar from "@/components/BottomNavbar";
import SidebarSkeleton from "@/components/SidebarSkeleton";

// Import Sidebar normally but show skeleton while loading
import Sidebar from "@/components/Sidebar";

// Non-critical components - lazy load
const OfflineIndicator = dynamic(
  () => import("@/components/OfflineIndicator"),
  {
    ssr: false,
    loading: () => <div />,
  }
);

// Defer task notifications initialization
const TaskNotificationInitializer = dynamic(
  () =>
    import("@/hooks/useTaskNotifications").then((mod) => {
      // Create a component wrapper for the hook
      const Component = () => {
        mod.useTaskNotifications();
        return null;
      };
      return { default: Component };
    }),
  { ssr: false }
);

const Layout = ({ children }: { children: ReactNode }) => {
  const { user, isInitialLoad } = useAuth();

  return (
    <>
      <ProtectedRoute>
        {/* Offline indicator - deferred */}
        <OfflineIndicator position="top" showConnectionInfo={true} />

        <div className="flex min-h-screen pwa-safe-area">
          {/* Sidebar for desktop - show skeleton during initial load */}
          {isInitialLoad && !user ? <SidebarSkeleton /> : <Sidebar />}

          {/* Main content area */}
          <div className="flex-1 w-full lg:pl-64">
            <div className="mb-25 lg:mb-0 min-h-screen w-full">{children}</div>
          </div>

          {/* Task notifications initializer - deferred */}
          <TaskNotificationInitializer />
        </div>
      </ProtectedRoute>

      {/* Bottom navbar for mobile - critical, outside ProtectedRoute for instant display */}
      <BottomNavbar />
    </>
  );
};

export default Layout;
