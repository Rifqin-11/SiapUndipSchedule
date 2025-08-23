"use client";

import {
  colorPairs,
  getCurrentDayAndDate,
  normalizeDayName,
} from "@/utils/date";
import React from "react";
import TodayCard from "./TodayCard";
import { useSubjects, Subject } from "@/hooks/useSubjects";

interface SubjectWithReschedule extends Subject {
  rescheduleDate?: string;
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
  const { subjects, loading, error, refetch } = useSubjects();

  // Handle attendance recording
  const handleAttendance = async (
    subjectId: string,
    rescheduleDate?: string
  ) => {
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

      // Refresh subjects data to get updated meeting count
      await refetch();

      return result;
    } catch (error) {
      console.error("Error recording attendance:", error);
      throw error;
    }
  };

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
  console.log("Unique days in database:", uniqueDays);

  // Check for subjects with invalid days
  const invalidDaySubjects = subjectsArray.filter(
    (s) => !s.day || typeof s.day !== "string"
  );
  if (invalidDaySubjects.length > 0) {
    console.warn(
      "Found subjects with invalid day property:",
      invalidDaySubjects
    );
  }

  const todaySubject = subjectsArray.filter((subject) => {
    // Skip subjects without a valid day property
    if (!subject.day || typeof subject.day !== "string") {
      console.log(
        `Skipping subject with invalid day: ${JSON.stringify(subject)}`
      );
      return false;
    }

    const normalizedSubjectDay = normalizeDayName(subject.day);
    const normalizedCurrentDay = normalizeDayName(currentDay);
    console.log(
      `Comparing normalized subject day "${normalizedSubjectDay}" with current day "${normalizedCurrentDay}"`
    );
    console.log(
      `Original subject day: "${subject.day}", current day: "${currentDay}"`
    );
    return normalizedSubjectDay === normalizedCurrentDay;
  });

  // Get reschedule classes for today
  const today = new Date();
  const todayString = today.toISOString().split("T")[0]; // YYYY-MM-DD format

  const rescheduleSubjects: SubjectWithReschedule[] = subjectsArray
    .filter((subject) => {
      if (!subject.reschedules || subject.reschedules.length === 0)
        return false;

      return subject.reschedules.some((reschedule) => {
        const rescheduleDate = new Date(reschedule.newDate);
        const rescheduleString = rescheduleDate.toISOString().split("T")[0];
        return rescheduleString === todayString;
      });
    })
    .map((subject) => {
      // Find the reschedule for today
      const todayReschedule = subject.reschedules?.find((reschedule) => {
        const rescheduleDate = new Date(reschedule.newDate);
        const rescheduleString = rescheduleDate.toISOString().split("T")[0];
        return rescheduleString === todayString;
      });

      return {
        ...subject,
        rescheduleDate: todayString,
        rescheduleInfo: todayReschedule,
      };
    });

  // Combine regular subjects and reschedule subjects
  const allTodaySubjects: SubjectWithReschedule[] = [
    ...todaySubject.map((s) => ({ ...s })),
    ...rescheduleSubjects,
  ];

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
        <p className="text-xs text-red-500">{error}</p>
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
        <div className="flex flex-col justify-center items-center mt-10">
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
};

export default TodaySubject;
