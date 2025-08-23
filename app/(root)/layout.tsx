"use client";

import React, { ReactNode } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import BottomNavbar from "@/components/BottomNavbar";
import Sidebar from "@/components/Sidebar";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        {/* Sidebar for desktop */}
        <Sidebar />

        {/* Main content area */}
        <div className="flex-1 w-full lg:pl-72">
          <div className="mb-25 lg:mb-0 min-h-screen w-full">{children}</div>
        </div>

        {/* Bottom navbar for mobile */}
        <BottomNavbar />
      </div>
    </ProtectedRoute>
  );
};

export default Layout;
