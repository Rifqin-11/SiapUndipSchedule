"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { formatLocalDate } from "@/utils/date";
import { Calendar, CheckCircle, X, Clock } from "lucide-react";
import { useState } from "react";

interface TimelineProps {
  weekNumber: number;
  startDate: string;
  endDate: string;
  status: "attended" | "not-attended" | "upcoming" | "no-meeting";
  isCurrentWeek?: boolean;
  meetings?: string[];
  attendance?: string[];
  // Edit attendance callback
  onAttendanceToggle?: (date: string, currentStatus?: string) => Promise<void>;
  subjectId?: string;
}

const Timeline = ({
  weekNumber,
  startDate,
  endDate,
  status,
  isCurrentWeek = false,
  meetings = [],
  attendance = [],
  onAttendanceToggle,
  subjectId,
}: TimelineProps) => {
  const [isLoading, setIsLoading] = useState(false);

  // Handle checkbox change for attendance toggle
  const handleCheckboxChange = async (checked: boolean) => {
    if (!onAttendanceToggle || !subjectId) return;
    if (status === "upcoming" || status === "no-meeting") return;

    // Allow toggling both ways: not-attended <-> attended
    if (
      (status === "not-attended" && checked) ||
      (status === "attended" && !checked)
    ) {
      setIsLoading(true);
      try {
        // Use the meeting date or current date for attendance
        const attendanceDate = meetings?.[0] || formatLocalDate(new Date());
        // Pass current status to determine action
        await onAttendanceToggle(attendanceDate, status);
      } catch (error) {
        console.error("Failed to toggle attendance:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Weekly timeline format
  const getStatusIcon = () => {
    switch (status) {
      case "attended":
        return (
          <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
        );
      case "not-attended":
        return (
          <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <X className="w-4 h-4 text-red-600 dark:text-red-400" />
          </div>
        );
      case "upcoming":
        return (
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
        );
      case "no-meeting":
      default:
        return (
          <div className="w-8 h-8 bg-gray-200 dark:bg-secondary rounded-full flex items-center justify-center">
            <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </div>
        );
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "attended":
        return "Attended";
      case "not-attended":
        return "Not Attended";
      case "upcoming":
        return "Upcoming";
      case "no-meeting":
        return "No Class";
      default:
        return "";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "attended":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "not-attended":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "upcoming":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "no-meeting":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300";
      default:
        return "";
    }
  };

  const getBorderColor = () => {
    if (isCurrentWeek) return "border-blue-500";
    switch (status) {
      case "attended":
        return "border-green-500";
      case "not-attended":
        return "border-red-500";
      case "upcoming":
        return "border-blue-300";
      case "no-meeting":
        return "border-gray-300";
      default:
        return "border-gray-300";
    }
  };

  const formatMeetingDates = () => {
    if (meetings && meetings.length > 0) {
      // Show the actual meeting dates instead of week ranges
      return meetings
        .map((meetingDate) => {
          const date = new Date(meetingDate);
          return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          });
        })
        .join(", ");
    }
    return "";
  };

  const formatDateRange = () => {
    // Instead of showing week range, show the meeting dates for this week
    if (meetings && meetings.length > 0) {
      return formatMeetingDates();
    }

    // Fallback to week range if no specific meetings
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const startStr = start.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      const endStr = end.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      return `${startStr} - ${endStr}`;
    }
    return "";
  };

  return (
    <div
      className={`flex items-center gap-4 p-4 bg-gray-50 dark:bg-black/20 rounded-lg border-l-4 ${getBorderColor()} ${
        isCurrentWeek ? "ring-2 ring-blue-200 dark:ring-blue-800" : ""
      }`}
    >
      <div className="flex-shrink-0">{getStatusIcon()}</div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                Meeting {weekNumber}
              </h4>
              {isCurrentWeek && (
                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">
                  This Week
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formatDateRange()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id={`timeline-week-${weekNumber}`}
              checked={status === "attended"}
              disabled={
                status === "upcoming" || status === "no-meeting" || isLoading
              }
              onCheckedChange={handleCheckboxChange}
              className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 cursor-pointer"
            />
          </div>
        </div>

        <div className="mt-2">
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}
          >
            {getStatusText()}
          </span>
          {attendance.length > 0 && status === "attended" && (
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
              ({attendance.length} time{attendance.length > 1 ? "s" : ""}{" "}
              attended)
            </span>
          )}
          {isLoading && (
            <span className="ml-2 text-xs text-blue-500">Updating...</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
