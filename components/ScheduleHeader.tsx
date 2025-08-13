"use client";

import Image from "next/image";
import React from "react";
import { useSubjects, Subject } from "@/hooks/useSubjects";
import { getCurrentDayAndDate, normalizeDayName } from "@/utils/date";

interface ScheduleHeaderProps {
  selectedDay?: string;
}

const ScheduleHeader = ({ selectedDay }: ScheduleHeaderProps) => {
  const { subjects, loading } = useSubjects();
  const { currentDay } = getCurrentDayAndDate();

  // Use selectedDay if provided, otherwise use current day
  const dayToCheck = selectedDay || currentDay;

  // Helper function to check if a subject has a valid schedule
  const hasValidSchedule = (subject: Subject) => {
    return (
      subject.day &&
      typeof subject.day === "string" &&
      subject.day.trim() !== "" &&
      subject.startTime &&
      typeof subject.startTime === "string" &&
      subject.startTime.trim() !== "" &&
      subject.endTime &&
      typeof subject.endTime === "string" &&
      subject.endTime.trim() !== ""
    );
  };

  // Count subjects for the selected day
  const subjectsToday = Array.isArray(subjects)
    ? subjects.filter((subject) => {
        if (!hasValidSchedule(subject)) return false;

        const normalizedSubjectDay = normalizeDayName(subject.day);
        const normalizedSelectedDay = normalizeDayName(dayToCheck);
        return normalizedSubjectDay === normalizedSelectedDay;
      })
    : [];

  const subjectCount = subjectsToday.length;

  // Generate appropriate message
  const getSubjectMessage = () => {
    if (loading) return "Loading subjects...";

    const isToday = dayToCheck === currentDay;
    const dayText = isToday ? "today" : dayToCheck;

    if (subjectCount === 0) {
      return `No classes scheduled for ${dayText}`;
    } else if (subjectCount === 1) {
      return `You have 1 subject ${isToday ? "today" : `on ${dayText}`}!`;
    } else {
      return `You have ${subjectCount} subjects ${
        isToday ? "today" : `on ${dayText}`
      }!`;
    }
  };

  return (
    <section className="flex flex-row gap-2 items-center mt-4 mb-2 mx-5">
      <div className="flex flex-row justify-between items-center w-full">
        <div className="flex flex-col gap-0.5 justify-center">
          <h1 className="font-bold text-xl">Calendar</h1>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {getSubjectMessage()}
          </p>
        </div>
        <div className="flex flex-row gap-2 items-center">
          <Image
            src="/ProfilePicture.jpg"
            alt="Profile Picture"
            width={30}
            height={30}
            className="rounded-full size-10"
          />
        </div>
      </div>
    </section>
  );
};

export default ScheduleHeader;
