"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Users } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getTodayMeeting, getMeetingStats } from "@/utils/meeting-calculator";
import { formatLocalDate } from "@/utils/date";

interface Subject {
  _id: string;
  name: string;
  lecturer: string[];
  startTime: string;
  endTime: string;
  room: string;
  bgColor: string;
  bgRoomColor: string;
  textColor: string;
  day: string;
  specificDate?: string; // For date-specific subjects
  meeting: number;
  meetingDates?: string[]; // Array of 14 meeting dates
  attendanceDates?: string[];
  reschedules?: Array<{
    originalDate: Date;
    newDate: Date;
    reason: string;
    startTime?: string;
    endTime?: string;
    room?: string;
    createdAt: Date;
  }>;
}

interface TodayCardProps {
  subject: Subject;
  currentDay: string;
  onAttendance: (subjectId: string, rescheduleDate?: string) => Promise<void>;
  rescheduleDate?: string; // Format: YYYY-MM-DD
}

const TodayCard: React.FC<TodayCardProps> = ({
  subject,
  currentDay,
  onAttendance,
  rescheduleDate,
}) => {
  const [isAttending, setIsAttending] = useState(false);
  const router = useRouter();

  // Destructure subject properties
  const {
    _id: id,
    name,
    lecturer,
    startTime,
    endTime,
    room,
    bgColor,
    bgRoomColor,
    textColor,
    day,
    meeting,
    meetingDates,
    attendanceDates = [],
  } = subject;

  const [currentMeeting, setCurrentMeeting] = useState(meeting);

  // Sync currentMeeting state with meeting prop when it changes
  useEffect(() => {
    setCurrentMeeting(meeting);
  }, [meeting]);

  // Calculate current meeting number and attendance stats from meetingDates
  const meetingInfo = useMemo(() => {
    if (meetingDates && Array.isArray(meetingDates)) {
      const today = formatLocalDate(new Date());
      const todayMeeting = getTodayMeeting(meetingDates, today);
      const stats = getMeetingStats(meetingDates, attendanceDates, today);

      if (todayMeeting) {
        return {
          currentMeeting: todayMeeting.meetingNumber,
          totalMeetings: meetingDates.length,
          hasScheduledMeetings: true,
          attendedMeetings: stats.attendedMeetings,
          passedMeetings: stats.passedMeetings,
          attendanceRate: stats.attendanceRate,
        };
      } else {
        // If no meeting today, still calculate stats
        return {
          currentMeeting: stats.passedMeetings + 1, // Next meeting number
          totalMeetings: meetingDates.length,
          hasScheduledMeetings: true,
          attendedMeetings: stats.attendedMeetings,
          passedMeetings: stats.passedMeetings,
          attendanceRate: stats.attendanceRate,
        };
      }
    }
    // Fallback to legacy system - use database meeting count
    return {
      currentMeeting: meeting, // Use database meeting count directly
      totalMeetings: 14,
      hasScheduledMeetings: false,
      attendedMeetings: attendanceDates?.length || 0,
      passedMeetings: meeting - 1,
      attendanceRate:
        meeting > 1
          ? Math.round(((attendanceDates?.length || 0) / (meeting - 1)) * 100)
          : 0,
    };
  }, [meetingDates, attendanceDates, meeting]); // Use meeting instead of currentMeeting

  // Check localStorage for attendance status
  const getAttendanceKey = () => {
    const today = rescheduleDate
      ? formatLocalDate(new Date(rescheduleDate))
      : formatLocalDate(new Date());
    return `attended_${id}_${today}`;
  };

  const [hasAttended, setHasAttended] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Mark component as client-side rendered
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Function to check attendance status from database and localStorage
  const checkAttendanceStatus = useCallback(async () => {
    try {
      const today = rescheduleDate
        ? formatLocalDate(new Date(rescheduleDate))
        : formatLocalDate(new Date());

      // First, check database for attendance status
      const response = await fetch(
        `/api/attendance-status?date=${today}&subjectId=${id}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.hasAttended) {
          // Found in database - sync to localStorage and update state
          const attendanceKey = `attended_${id}_${today}`;
          localStorage.setItem(attendanceKey, "true");
          setHasAttended(true);
          return;
        }
      }

      // Fallback to localStorage if database check fails or no record found
      const attendanceKey = `attended_${id}_${
        rescheduleDate || new Date().toDateString()
      }`;
      const localStatus = localStorage.getItem(attendanceKey) === "true";
      setHasAttended(localStatus);
    } catch (error) {
      console.warn("Error checking attendance status:", error);
      // Fallback to localStorage on error
      const attendanceKey = `attended_${id}_${
        rescheduleDate || new Date().toDateString()
      }`;
      const localStatus = localStorage.getItem(attendanceKey) === "true";
      setHasAttended(localStatus);
    }
  }, [id, rescheduleDate]);

  // Check localStorage on client side only
  useEffect(() => {
    if (typeof window !== "undefined") {
      checkAttendanceStatus();
    }
  }, [checkAttendanceStatus]);

  // Check if today is the same as subject day OR if this is a reschedule date
  const isToday = rescheduleDate
    ? true
    : day.toLowerCase() === currentDay.toLowerCase();

  // Compute whether to show attendance section with stable memoization
  const shouldShowAttendance = useMemo(() => {
    return isClient && isToday && !hasAttended;
  }, [isClient, isToday, hasAttended]);

  const handleAttendance = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking button
    if (!onAttendance) return;

    setIsAttending(true);
    try {
      await onAttendance(id, rescheduleDate);
      // Remove manual state increment - let the data refetch handle it
      setHasAttended(true); // Mark as attended
      localStorage.setItem(getAttendanceKey(), "true"); // Save to localStorage

      // Save to attendance history
      try {
        const attendanceDate = rescheduleDate
          ? new Date(rescheduleDate)
          : new Date();

        const historyData = {
          subjectId: id,
          subjectName: name,
          attendanceDate: attendanceDate.toISOString(),
          location: room,
          notes: rescheduleDate
            ? `Reschedule class - Attendance ${
                meetingInfo.attendedMeetings + 1
              }/14`
            : `Regular class - Attendance ${
                meetingInfo.attendedMeetings + 1
              }/14`,
        };

        const historyResponse = await fetch("/api/attendance-history", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(historyData),
        });

        if (!historyResponse.ok) {
          console.warn(
            "Failed to save attendance history, but attendance was recorded"
          );
        }
      } catch (historyError) {
        console.warn("Error saving attendance history:", historyError);
        // Don't show error to user as main attendance was successful
      }

      const attendanceType = rescheduleDate
        ? "reschedule class"
        : "regular class";
      toast.success(
        `Attendance recorded for ${name} (${attendanceType})! Total attended: ${
          meetingInfo.attendedMeetings + 1
        }/14`
      );
    } catch (error) {
      console.error("Error recording attendance:", error);
      toast.error("Failed to record attendance. Please try again.");
    } finally {
      setIsAttending(false);
    }
  };

  const handleCardClick = () => {
    router.push(`/subject-detail/${id}`);
  };
  return (
    <div
      onClick={handleCardClick}
      className={`flex flex-col ${bgColor} justify-around rounded-3xl p-3 w-full min-h-35 cursor-pointer hover:scale-101 transition-transform duration-200`}
    >
      <div className="flex flex-row mt-2 justify-between items-center">
        <div className="flex flex-col">
          <h1 className={`font-extrabold text max-w-50 ${textColor}`}>
            {name}
          </h1>
          {rescheduleDate && (
            <span
              className={`text-xs font-medium text-white px-2 py-1 rounded-full mt-1 w-fit ${bgRoomColor}`}
            >
              Reschedule Class
            </span>
          )}
        </div>
        <div className={`text-xs text-right ${textColor} `}>
          {lecturer.map((lecturerName: string, index: number) => (
            <p
              key={index}
              className="truncate overflow-hidden whitespace-nowrap max-w-[140px]"
            >
              {lecturerName}
            </p>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-row justify-between items-center">
        <div className={textColor}>
          <h1 className="font-bold">{startTime}</h1>
          <p className="text-xs">Start</p>
        </div>
        <div
          className={`${bgRoomColor} p-1 px-5 rounded-3xl font-bold flex justify-center items-center  text-white`}
        >
          {room}
        </div>
        <div className={textColor}>
          <h1 className="font-bold">{endTime}</h1>
          <p className="text-xs">End</p>
        </div>
      </div>

      {/* Meeting progress and attendance button - only show if today is class day and haven't attended */}
      {shouldShowAttendance && (
        <div className="mt-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-1 ${textColor}`}>
              <Users className="w-4 h-4" />
              <span className="text-xs font-medium">
                Attendance {meetingInfo.attendedMeetings}/
                {meetingInfo.totalMeetings}
                {meetingInfo.hasScheduledMeetings && (
                  <span className="ml-1 text-xs opacity-75">
                    (
                    {Math.round(
                      (meetingInfo.attendedMeetings /
                        meetingInfo.totalMeetings) *
                        100
                    )}
                    %)
                  </span>
                )}
              </span>
            </div>
            <div className="w-20 bg-gray-200 rounded-full h-1.5 dark:bg-secondary">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    meetingInfo.totalMeetings > 0
                      ? (meetingInfo.attendedMeetings /
                          meetingInfo.totalMeetings) *
                        100
                      : 0
                  }%`,
                }}
              ></div>
            </div>
          </div>

          <Button
            onClick={handleAttendance}
            disabled={isAttending}
            className={`w-full ${bgRoomColor} text-white text-sm py-2 transition-all duration-200`}
            size="sm"
          >
            {isAttending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Recording...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Attend Class
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default TodayCard;
