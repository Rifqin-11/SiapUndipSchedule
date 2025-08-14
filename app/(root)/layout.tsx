"use client";

import React, { ReactNode } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import BottomNavbar from "@/components/BottomNavbar";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <ProtectedRoute>
      <div className="mb-25">
        {children}
        <BottomNavbar />
      </div>
    </ProtectedRoute>
  );
};

export default Layout;
