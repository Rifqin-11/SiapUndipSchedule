import React from "react";

const ManageSubjectsSkeleton = () => {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      {/* Header */}
      <section className="flex flex-row gap-2 items-center pt-4 pb-2 mx-5">
        <div className="w-8 h-8 bg-gray-300 rounded"></div>
        <div className="flex flex-row justify-center items-center w-full">
          <div className="flex flex-col gap-0.5 justify-center text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="w-6 h-6 bg-gray-300 rounded"></div>
              <div className="h-6 w-32 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Search and Filter */}
        <div className="bg-white dark:bg-card rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="h-4 w-16 bg-gray-300 rounded mb-2"></div>
              <div className="h-10 w-full bg-gray-200 rounded"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-24 bg-gray-300 rounded"></div>
              <div className="h-10 w-20 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-card rounded-xl p-6 text-center border border-gray-200 dark:border-gray-700"
            >
              <div className="h-8 w-12 bg-gray-300 rounded mx-auto mb-2"></div>
              <div className="h-4 w-20 bg-gray-200 rounded mx-auto"></div>
            </div>
          ))}
        </div>

        {/* Subject Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-card rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="h-6 w-32 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded mb-1"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                </div>
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
              </div>

              {/* Time and Room */}
              <div className="flex justify-between items-center mb-4">
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
                <div className="h-6 w-20 bg-gray-300 rounded"></div>
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="h-3 w-16 bg-gray-200 rounded"></div>
                  <div className="h-3 w-12 bg-gray-200 rounded"></div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gray-300 h-2 rounded-full w-1/2"></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-20 right-6">
          <div className="w-14 h-14 bg-gray-300 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default ManageSubjectsSkeleton;
