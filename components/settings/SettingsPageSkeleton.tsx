import React from "react";

const SettingsPageSkeleton = () => {
  return (
    <div className="min-h-screen animate-pulse">
      {/* Header */}
      <section className="flex flex-row gap-2 items-center pt-4 pb-2 mx-5">
        <div className="w-8 h-8 bg-gray-300 rounded"></div>
        <div className="flex flex-row justify-center items-center w-full">
          <div className="flex flex-col gap-0.5 justify-center text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="w-6 h-6 bg-gray-300 rounded"></div>
              <div className="h-6 w-20 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-full mx-auto p-6 space-y-6">
        {/* Theme Section */}
        <div className="bg-white dark:bg-card rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="h-6 w-32 bg-gray-300 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-gray-300 rounded"></div>
                  <div className="h-4 w-20 bg-gray-300 rounded"></div>
                </div>
                <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-white dark:bg-card rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="h-6 w-28 bg-gray-300 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div>
                  <div className="h-4 w-32 bg-gray-300 rounded mb-1"></div>
                  <div className="h-3 w-48 bg-gray-200 rounded"></div>
                </div>
                <div className="w-12 h-6 bg-gray-200 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Data & Privacy Section */}
        <div className="bg-white dark:bg-card rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="h-6 w-36 bg-gray-300 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="block p-4 border border-gray-200 dark:border-gray-600 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-300 rounded-xl"></div>
                  <div className="flex-1 min-w-0">
                    <div className="h-4 w-28 bg-gray-300 rounded mb-1"></div>
                    <div className="h-3 w-40 bg-gray-200 rounded"></div>
                  </div>
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Support Section */}
        <div className="bg-white dark:bg-card rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="h-6 w-24 bg-gray-300 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="block p-4 border border-gray-200 dark:border-gray-600 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-300 rounded-xl"></div>
                  <div className="flex-1 min-w-0">
                    <div className="h-4 w-24 bg-gray-300 rounded mb-1"></div>
                    <div className="h-3 w-36 bg-gray-200 rounded"></div>
                  </div>
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* About Section */}
        <div className="bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-400 rounded-full mx-auto mb-4"></div>
            <div className="h-6 w-32 bg-gray-400 rounded mx-auto mb-2"></div>
            <div className="h-4 w-20 bg-gray-300 rounded mx-auto mb-4"></div>
            <div className="h-3 w-48 bg-gray-300 rounded mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPageSkeleton;
