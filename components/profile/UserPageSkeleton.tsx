import React from "react";

const UserPageSkeleton = () => {
  return (
    <div className="min-h-screen animate-pulse">
      {/* Header */}
      <section className="flex flex-row gap-2 items-center pt-4 pb-2 mx-5">
        <div className="flex flex-row justify-center items-center w-full">
          <div className="flex flex-col gap-0.5 justify-center text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="w-6 h-6 bg-gray-300 rounded"></div>
              <div className="h-6 w-16 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Profile Picture and Name */}
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto"></div>
            <div className="absolute bottom-1 right-1 w-8 h-8 bg-gray-200 rounded-full"></div>
          </div>
          <div>
            <div className="h-8 w-48 bg-gray-300 rounded mx-auto mb-2"></div>
            <div className="h-4 w-64 bg-gray-200 rounded mx-auto mb-1"></div>
            <div className="h-4 w-56 bg-gray-200 rounded mx-auto"></div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-card rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700"
            >
              <div className="h-8 w-12 bg-gray-300 rounded mx-auto mb-2"></div>
              <div className="h-3 w-16 bg-gray-200 rounded mx-auto"></div>
            </div>
          ))}
        </div>

        {/* Account Settings */}
        <div className="space-y-3">
          <div className="h-6 w-32 bg-gray-300 rounded px-2"></div>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-4 bg-white dark:bg-card rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-300 rounded-xl"></div>
                <div className="flex-1 min-w-0">
                  <div className="h-5 w-32 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 w-48 bg-gray-200 rounded"></div>
                </div>
                <div className="w-5 h-5 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Academic Info */}
        <div className="bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl p-6">
          <div className="h-6 w-40 bg-gray-400 rounded mb-3"></div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <div className="h-3 w-16 bg-gray-400 rounded mb-1"></div>
                <div className="h-4 w-24 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <div className="w-full h-12 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  );
};

export default UserPageSkeleton;
