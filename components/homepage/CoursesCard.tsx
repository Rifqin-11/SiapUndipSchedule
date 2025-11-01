import React from "react";
import { Progress } from "../ui/progress";
import { getMeetingStats } from "@/utils/meeting-calculator";

type Subject = {
  name: string;
  meeting: number;
  specificDate?: string; // If this exists, it means it's not repeating weekly
  meetingDates?: string[]; // Array of meeting dates
  attendanceDates?: string[]; // Array of attendance dates
};

const CoursesCard = ({
  name,
  meeting,
  specificDate,
  meetingDates = [],
  attendanceDates = [],
}: Subject) => {
  const progressMeeting = (meeting / 14) * 100;
  // Calculate attendance-based progress
  const attendanceStats = React.useMemo(() => {
    if (specificDate) {
      // One-time subject
      return {
        attendedMeetings: attendanceDates.length > 0 ? 1 : 0,
        totalMeetings: 1,
        attendanceRate: attendanceDates.length > 0 ? 100 : 0,
      };
    } else if (meetingDates.length > 0) {
      // Use meeting calculator for scheduled subjects
      const stats = getMeetingStats(meetingDates, attendanceDates);
      return {
        attendedMeetings: stats.attendedMeetings,
        totalMeetings: stats.totalMeetings,
        attendanceRate: stats.attendanceRate,
      };
    } else {
      // Legacy fallback
      return {
        attendedMeetings: attendanceDates.length,
        totalMeetings: 14,
        attendanceRate: Math.round((attendanceDates.length / 14) * 100),
      };
    }
  }, [specificDate, meetingDates, attendanceDates]);

  const progressPercentage = attendanceStats.attendanceRate;

  return (
    <div className="flex flex-col bg-white dark:bg-card border rounded-xl shadow-md p-3 max-h-[150px] gap-4">
      <div className="bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 px-2 py-0.5 rounded-full text-xs font-semibold w-fit">
        {specificDate ? (
          "One-time"
        ) : progressMeeting < 75 ? (
          "High"
        ) : (
          <span className="text-green-900">Low</span>
        )}
      </div>

      <div className="text-blue-900 dark:text-white font-bold text-base leading-snug line-clamp-2">
        {name}
      </div>

      <div className="flex flex-col gap-1 mt-1">
        <div className="flex justify-between text-xs text-gray-700 dark:text-gray-300">
          <span>Attendance</span>
          <span className="text-blue-900 dark:text-blue-400">{meeting}/14</span>
        </div>
        <Progress
          value={Math.round(progressMeeting)}
          aria-label={`Attendance progress for ${name}`}
          className="bg-blue-100 dark:bg-gray-800"
        />
      </div>
    </div>
  );
};

export default CoursesCard;
