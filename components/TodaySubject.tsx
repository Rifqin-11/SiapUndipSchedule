"use client";

import {
  colorPairs,
  getCurrentDayAndDate,
  normalizeDayName,
} from "@/utils/date";
import Link from "next/link";
import React from "react";
import TodayCard from "./TodayCard";
import { useSubjects } from "@/hooks/useSubjects";

const TodaySubject = () => {
  const { currentDay } = getCurrentDayAndDate();
  const { subjects, loading, error } = useSubjects();

  // Ensure subjects is always an array
  const subjectsArray = Array.isArray(subjects) ? subjects : [];

  // Debug logging
  console.log("TodaySubject Debug:");
  console.log("Current day from utils:", currentDay);
  console.log("All subjects:", subjectsArray);
  console.log("Subjects count:", subjectsArray.length);

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

  console.log("Filtered subjects for today:", todaySubject);
  console.log("Today subjects count:", todaySubject.length);

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
      {todaySubject.length > 0 ? (
        todaySubject.map((subject) => {
          const randomColor =
            colorPairs[Math.floor(Math.random() * colorPairs.length)];
          return (
            <Link href={`/subject-detail/${subject.id}`} key={subject.id}>
              <TodayCard
                {...subject}
                key={subject.id}
                bgColor={randomColor.bg}
                textColor={randomColor.text}
                bgRoomColor={randomColor.roomBg}
              />
            </Link>
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
