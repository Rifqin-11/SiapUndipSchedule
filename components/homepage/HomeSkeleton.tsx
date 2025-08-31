import React from "react";
import CurrentDayDate from "@/components/homepage/CurrentDayDate";

const HomeSkeleton = () => {
  return (
    <main className="animate-pulse">
      {/* Header Section */}
      <section className="flex flex-col mt-6 mx-6 text-lg dark:text-white space-y-1">
        <h1 className="text-xl font-extrabold tracking-tight">
          Hi, here&apos;s your schedule
        </h1>
        <CurrentDayDate />
      </section>

      {/* Stats Cards Skeleton */}
      <section className="mt-6">
        <div className="grid grid-cols-3 gap-4 mx-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-card rounded-xl p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex flex-col items-center space-y-2">
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-6 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Today's Subjects Skeleton */}
      <section className="mt-6 mx-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>

        {/* Subject Cards */}
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-card rounded-xl p-4 border border-gray-200 dark:border-gray-700"
            >
              {/* Subject Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>

              {/* Time Info */}
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

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-gray-300 dark:bg-gray-600 h-2 rounded-full w-1/2"></div>
                </div>
                <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Courses Overview Skeleton */}
      <section className="mt-8 mx-6 pb-20">
        <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>

        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-card rounded-xl p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="space-y-3">
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-gray-300 dark:bg-gray-600 h-2 rounded-full w-3/4"></div>
                </div>
                <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default HomeSkeleton;
