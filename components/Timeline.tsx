"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, CheckCircle } from "lucide-react";

interface TimelineProps {
  meetingNumber?: number;
  date?: string;
  isCompleted?: boolean;
}

const Timeline = ({
  meetingNumber = 1,
  date = "Mon, 5 February 2025",
  isCompleted = true,
}: TimelineProps) => {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border-l-4 border-blue-500">
      <div className="flex-shrink-0">
        {isCompleted ? (
          <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
        ) : (
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
            <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              Pertemuan {meetingNumber}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {date}
            </p>
          </div>

          <div className="flex items-center">
            <Checkbox
              id={`timeline-${meetingNumber}`}
              checked={isCompleted}
              className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
            />
          </div>
        </div>

        {isCompleted && (
          <div className="mt-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
              Hadir
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Timeline;
