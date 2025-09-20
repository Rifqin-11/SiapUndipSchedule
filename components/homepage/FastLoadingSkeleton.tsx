import React from "react";
import CurrentDayDate from "@/components/homepage/CurrentDayDate";

const FastLoadingSkeleton = () => {
  return (
    <main className="animate-pulse">
      {/* Header Section - Show immediately */}
      <section className="flex flex-col mt-6 mx-6 text-lg dark:text-white space-y-1">
        <h1 className="text-xl font-extrabold tracking-tight">
          Hi, here&apos;s your schedule
        </h1>
        <CurrentDayDate />
      </section>

      {/* Quick Stats Skeleton - minimal and fast */}
      <section className="mt-6">
        <div className="grid grid-cols-3 gap-4 mx-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-card rounded-xl p-3 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex flex-col items-center space-y-1">
                <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 w-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-2 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Today's Schedule Skeleton - simplified */}
      <section className="mt-6 mx-6">
        <div className="flex items-center justify-between mb-3">
          <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-6 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>

        {/* Subject Cards - minimal */}
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-card rounded-lg p-3 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1"></div>
                  <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-3 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tasks Section Skeleton - minimal */}
      <section className="mt-6 mx-6 pb-20">
        <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3"></div>
        <div className="space-y-2">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-card rounded-lg p-3 border border-gray-200 dark:border-gray-700"
            >
              <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1"></div>
              <div className="h-3 w-1/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </section>

      {/* Loading indicator */}
      <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2">
        <div className="bg-white dark:bg-gray-800 rounded-full px-4 py-2 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">Loading...</span>
          </div>
        </div>
      </div>
    </main>
  );
};

export default FastLoadingSkeleton;
