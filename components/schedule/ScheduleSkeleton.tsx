import React from "react";
import PageHeader from "../PageHeader";

const ScheduleSkeleton = () => {
  return (
    <div className="animate-pulse">
      <PageHeader variant="calendar" />
      {/* Horizontal Calendar Skeleton */}
      <div className="mx-5 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center min-w-[60px] p-3 rounded-xl bg-gray-200 dark:bg-gray-700"
            >
              <div className="h-3 w-8 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
              <div className="h-6 w-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Header Section Skeleton */}
      <section className="mt-6">
        <div className="mx-5 flex justify-between items-center mb-4">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>

        {/* Subject Cards Skeleton */}
        <div className="space-y-4 mx-5">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-card rounded-xl border border-border p-4"
            >
              {/* Subject Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>

              {/* Time and Room Info */}
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>

              {/* Lecturer Info */}
              <div className="flex items-center gap-2 mb-3">
                <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                <div className="bg-gray-300 dark:bg-gray-600 h-2 rounded-full w-1/3"></div>
              </div>
              <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ScheduleSkeleton;
