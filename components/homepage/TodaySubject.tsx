"use client";

import React, { useMemo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  colorPairs,
  getCurrentDayAndDate,
  normalizeDayName,
  formatLocalDate,
} from "@/utils/date";
import TodayCard from "@/components/homepage/TodayCard";
import { useSubjects, Subject, SUBJECTS_QUERY_KEY } from "@/hooks/useSubjects";
import { getTodayMeeting, isClassDay } from "@/utils/meeting-calculator";

interface SubjectWithReschedule extends Subject {
  rescheduleDate?: string;
  specificDate?: string; // For date-specific subjects
  rescheduleInfo?: {
    originalDate: Date;
    newDate: Date;
    reason: string;
    startTime?: string;
    endTime?: string;
    room?: string;
    createdAt: Date;
  };
}

const TodaySubject = () => {
  const { currentDay } = getCurrentDayAndDate();
  const queryClient = useQueryClient();
  const {
    data: subjects = [],
    isLoading: loading,
    error,
    refetch,
  } = useSubjects();

  // Memoize calculations to prevent re-computation
  const { allTodaySubjects } = useMemo(() => {
    // Ensure subjects is always an array
    const subjectsArray = Array.isArray(subjects) ? subjects : [];

    // Check unique days in database
    const uniqueDays = [
      ...new Set(
        subjectsArray
          .map((s) => s.day)
          .filter((day) => day !== null && day !== undefined)
      ),
    ];

    // Only log in development and when data actually changes
    if (process.env.NODE_ENV === "development" && uniqueDays.length > 0) {
      console.log("Unique days in database:", uniqueDays);
    }

    // Check for subjects with invalid days
    const invalidDaySubjects = subjectsArray.filter(
      (s) => !s.day || typeof s.day !== "string"
    );
    if (
      invalidDaySubjects.length > 0 &&
      process.env.NODE_ENV === "development"
    ) {
      console.warn(
        "Found subjects with invalid day property:",
        invalidDaySubjects
      );
    }

    const todaySubject = subjectsArray.filter((subject) => {
      const today = new Date();
      const todayString = formatLocalDate(today); // YYYY-MM-DD format

      // Check if subject is date-specific for today
      if (subject.specificDate) {
        return subject.specificDate === todayString;
      }

      // Use meetingDates array if available (new system)
      if (subject.meetingDates && Array.isArray(subject.meetingDates)) {
        const todayMeeting = getTodayMeeting(subject.meetingDates, todayString);
        return todayMeeting !== null; // Returns true if today is a class day
      }

      // Fallback to legacy system for older subjects
      // For recurring subjects, check day match
      // Skip subjects without a valid day property
      if (!subject.day || typeof subject.day !== "string") {
        if (process.env.NODE_ENV === "development") {
          console.log(
            `Skipping subject with invalid day: ${JSON.stringify(subject)}`
          );
        }
        return false;
      }

      const normalizedSubjectDay = normalizeDayName(subject.day);
      const normalizedCurrentDay = normalizeDayName(currentDay);

      if (process.env.NODE_ENV === "development") {
        console.log(
          `Comparing normalized subject day "${normalizedSubjectDay}" with current day "${normalizedCurrentDay}"`
        );
        console.log(
          `Original subject day: "${subject.day}", current day: "${currentDay}"`
        );
      }
      return normalizedSubjectDay === normalizedCurrentDay;
    });

    // Get reschedule classes for today
    const today = new Date();
    const todayString = formatLocalDate(today); // YYYY-MM-DD format

    const rescheduleSubjects: SubjectWithReschedule[] = subjectsArray
      .filter((subject) => {
        if (!subject.reschedules || subject.reschedules.length === 0)
          return false;

        return subject.reschedules.some((reschedule) => {
          const rescheduleDate = new Date(reschedule.newDate);
          const rescheduleString = formatLocalDate(rescheduleDate);
          return rescheduleString === todayString;
        });
      })
      .map((subject) => {
        // Find the reschedule for today
        const todayReschedule = subject.reschedules?.find((reschedule) => {
          const rescheduleDate = new Date(reschedule.newDate);
          const rescheduleString = formatLocalDate(rescheduleDate);
          return rescheduleString === todayString;
        });

        return {
          ...subject,
          rescheduleDate: todayString,
          rescheduleInfo: todayReschedule,
        };
      });

    // Combine regular subjects and reschedule subjects
    const combinedSubjects: SubjectWithReschedule[] = [
      ...todaySubject.map((s) => ({ ...s })),
      ...rescheduleSubjects,
    ];

    const timeToMinutes = (timeString: string): number => {
      if (!timeString) return 0;

      try {
        // Handle various time formats: "HH:MM", "H:MM", "HH.MM", etc.
        const cleanTime = timeString.trim().replace(/[^\d:]/g, "");
        const [hours, minutes] = cleanTime.split(":").map(Number);

        if (isNaN(hours) || isNaN(minutes)) {
          console.warn(`Invalid time format: ${timeString}`);
          return 0;
        }

        return hours * 60 + minutes;
      } catch (error) {
        console.warn(`Error parsing time: ${timeString}`, error);
        return 0;
      }
    };

    // Sort subjects by start time
    const allTodaySubjects = combinedSubjects.sort((a, b) => {
      // Get start time - prioritize reschedule info if available
      const aStartTime = a.rescheduleInfo?.startTime || a.startTime || "";
      const bStartTime = b.rescheduleInfo?.startTime || b.startTime || "";

      const aMinutes = timeToMinutes(aStartTime);
      const bMinutes = timeToMinutes(bStartTime);

      // Sort by time (earliest first)
      if (aMinutes !== bMinutes) {
        return aMinutes - bMinutes;
      }

      // If times are equal, sort by subject name as secondary sort
      const aName = a.name || "";
      const bName = b.name || "";
      return aName.localeCompare(bName);
    });

    // Add debug logging for sorted results
    if (process.env.NODE_ENV === "development" && allTodaySubjects.length > 0) {
      console.log(
        "Today subjects sorted by time:",
        allTodaySubjects.map((s) => ({
          name: s.name,
          startTime: s.rescheduleInfo?.startTime || s.startTime,
          isReschedule: !!s.rescheduleDate,
        }))
      );
    }

    return {
      uniqueDays,
      allTodaySubjects,
    };
  }, [subjects, currentDay]); // Only recalculate when subjects or currentDay change

  // Handle attendance recording
  const handleAttendance = useCallback(
    async (subjectId: string, rescheduleDate?: string) => {
      try {
        const requestBody: { rescheduleDate?: string } = {};
        if (rescheduleDate) {
          requestBody.rescheduleDate = rescheduleDate;
        }

        const response = await fetch(`/api/subjects/${subjectId}/attendance`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Failed to record attendance");
        }

        // Force invalidate ALL subject-related cache and refetch fresh data
        await queryClient.invalidateQueries({ queryKey: SUBJECTS_QUERY_KEY });
        await queryClient.invalidateQueries({ queryKey: ["subject"] }); // All single subject queries

        // Clear all caches and force complete refresh
        await queryClient.clear();

        // Add delay to ensure cache is fully cleared
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Force refetch all subject-related queries
        await queryClient.refetchQueries({ queryKey: SUBJECTS_QUERY_KEY });
        await queryClient.refetchQueries({ queryKey: ["subject"] });

        await refetch();

        return result;
      } catch (error) {
        console.error("❌ Error recording attendance:", error);
        throw error;
      }
    },
    [refetch, queryClient]
  );

  // Memoize render to prevent unnecessary re-renders
  const renderedContent = useMemo(() => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col justify-center items-center mt-10">
          <h3 className="font-bold text-lg text-red-600">Error</h3>
          <p className="text-xs text-red-500">{error?.message}</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4">
        {allTodaySubjects.length > 0 ? (
          allTodaySubjects.map((subject) => {
            // Use subject ID to generate consistent color index
            const subjectId = subject._id || subject.id || "";
            const colorIndex =
              subjectId
                .split("")
                .reduce((acc, char) => acc + char.charCodeAt(0), 0) %
              colorPairs.length;
            const consistentColor = colorPairs[colorIndex];

            // Create subject object with color properties
            const subjectWithColors = {
              ...subject,
              _id: subject._id || subject.id, // Ensure _id is always present
              bgColor: consistentColor.bg,
              textColor: consistentColor.text,
              bgRoomColor: consistentColor.roomBg,
            };

            return (
              <div key={`${subject.id}-${subject.rescheduleDate || "regular"}`}>
                <TodayCard
                  subject={subjectWithColors}
                  currentDay={currentDay}
                  onAttendance={handleAttendance}
                  rescheduleDate={subject.rescheduleDate}
                />
              </div>
            );
          })
        ) : (
          <div className="flex flex-col justify-center items-center mt-10 mb-10">
            <h3 className="font-bold text-lg text-gray-700 dark:text-gray-300">
              No Schedule Today 🎉
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Enjoy your free day!
            </p>
          </div>
        )}
      </div>
    );
  }, [loading, error, allTodaySubjects, currentDay, handleAttendance]);

  return renderedContent;
};

export default React.memo(TodaySubject);
