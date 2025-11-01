import React from "react";

const AttendanceHistorySkeleton = () => {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-gray-300 rounded"></div>
          <div className="h-8 w-48 bg-gray-300 rounded"></div>
        </div>
        <div className="h-4 w-40 bg-gray-200 rounded"></div>
      </div>

      {/* Refresh Button */}
      <div className="mb-6">
        <div className="h-10 w-24 bg-gray-300 rounded"></div>
      </div>

      {/* Attendance History Cards */}
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-sm border border-gray-200"
          >
            {/* Date Header */}
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 px-6 py-4 border-b border-gray-200">
              <div className="h-6 w-32 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 w-40 bg-gray-200 rounded"></div>
            </div>

            {/* Attendance Records */}
            <div className="divide-y divide-gray-100">
              {[1, 2].map((j) => (
                <div key={j} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Subject Name */}
                      <div className="h-6 w-48 bg-gray-300 rounded mb-2"></div>

                      {/* Details */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gray-200 rounded"></div>
                          <div className="h-4 w-32 bg-gray-200 rounded"></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gray-200 rounded"></div>
                          <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 bg-gray-200 rounded mt-0.5"></div>
                          <div className="h-4 w-40 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="ml-4">
                      <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Card */}
      <div className="mt-8 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg p-6 border border-gray-200">
        <div className="h-6 w-40 bg-gray-300 rounded mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center">
              <div className="h-8 w-12 bg-gray-300 rounded mx-auto mb-2"></div>
              <div className="h-4 w-24 bg-gray-200 rounded mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AttendanceHistorySkeleton;
