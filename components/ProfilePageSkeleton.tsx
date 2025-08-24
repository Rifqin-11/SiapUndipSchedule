import React from "react";

const ProfilePageSkeleton = () => {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      {/* Header */}
      <section className="flex flex-row gap-2 items-center pt-4 pb-2 mx-5">
        <div className="w-8 h-8 bg-gray-300 rounded"></div>
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
        {/* Profile Picture */}
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-32 h-32 bg-gray-300 rounded-full mx-auto"></div>
            <div className="absolute bottom-2 right-2 w-8 h-8 bg-gray-200 rounded-full"></div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-card rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <div className="h-6 w-40 bg-gray-300 rounded"></div>
            <div className="h-10 w-16 bg-gray-300 rounded"></div>
          </div>

          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i}>
                <div className="h-4 w-20 bg-gray-300 rounded mb-1"></div>
                <div className="w-full h-10 bg-gray-100 dark:bg-secondary rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePageSkeleton;
