"use client";

import React from "react";

const SidebarSkeleton = () => {
  return (
    <aside className="fixed left-0 top-0 z-40 w-64 h-screen bg-white dark:bg-background border-r border-gray-200 dark:border-border hidden lg:block">
      <div className="h-full px-3 py-4 overflow-y-auto">
        {/* Logo/Header Skeleton */}
        <div className="flex items-center mb-5">
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="ml-3 h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>

        {/* Profile Section Skeleton */}
        <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
            <div className="flex-1">
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1"></div>
              <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Navigation Menu Skeleton */}
        <ul className="space-y-2 font-medium">
          {[...Array(6)].map((_, i) => (
            <li key={i}>
              <div className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="ml-3 h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </li>
          ))}
        </ul>

        {/* Bottom Section Skeleton */}
        <div className="absolute bottom-4 left-3 right-3">
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
            <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SidebarSkeleton;
