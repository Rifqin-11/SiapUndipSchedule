"use client";

import NotifIcon from "@/components/NotifIcon";
import Image from "next/image";
import React, { ReactNode } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import ProtectedRoute from "@/components/ProtectedRoute";

const Layout = ({ children }: { children: ReactNode }) => {
  const { user } = useUserProfile();

  // Get user name, default to "User" if not available
  const userName = user?.name || "User";

  return (
    <ProtectedRoute>
      <div className="">
        <section className="flex flex-row gap-2 items-center mt-4 mx-5">
          <div className="flex flex-row justify-between items-center w-full">
            <div className="flex flex-row gap-2 items-center">
              {user?.profileImage ? (
                <Image
                  src={user.profileImage}
                  alt="Profile Picture"
                  width={40}
                  height={40}
                  className="rounded-full size-10 object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {userName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
              )}
              <div>
                <h1 className="font-bold">{userName}</h1>
                <p className="text-xs text-gray-800 dark:text-gray-300">Welcome Back!</p>
              </div>
            </div>
            <div>
              <NotifIcon />
            </div>
          </div>
        </section>

        {children}
      </div>
    </ProtectedRoute>
  );
};

export default Layout;
