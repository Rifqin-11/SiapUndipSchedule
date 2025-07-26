"use client";

import React from "react";
import CoursesCard from "@/components/CoursesCard";
import TodaySubject from "@/components/TodaySubject";
import CurrentDayDate from "@/components/CurrentDayDate";
import { useSubjects } from "@/hooks/useSubjects";

const MAX_MEETING = 14;

const Page = () => {
  const { subjects, loading, error } = useSubjects();

  const allMeetingsSafe = subjects.every(
    (subject) => (subject.meeting / MAX_MEETING) * 100 >= 75
  );

  if (loading) {
    return (
      <main className="animate-fadeIn">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="animate-fadeIn">
        <div className="flex flex-col justify-center items-center h-64">
          <h1 className="font-bold text-lg text-red-600">Error</h1>
          <p className="text-xs text-red-500">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="animate-fadeIn">
      <section className="flex flex-col mt-6 mx-6 text-lg dark:text-white space-y-1">
        <h1 className="text-xl font-extrabold tracking-tight">
          Hi, here’s your schedule
        </h1>
        <CurrentDayDate />
      </section>

      <section className="mt-6 dark:text-white">
        <div className="flex flex-row justify-between items-center mx-6 mb-2">
          <h2 className="font-bold text-xl">Your Courses</h2>
          <button className="text-xs text-blue-600 hover:underline dark:text-blue-400">
            View more
          </button>
        </div>

        <div className="overflow-x-auto px-6 py-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          <div className="flex gap-4">
            {!allMeetingsSafe ? (
              subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="w-[280px] shrink-0 transition-transform duration-200 hover:scale-105"
                >
                  <CoursesCard {...subject} />
                </div>
              ))
            ) : (
              <p className="text-sm text-green-700 dark:text-green-300">
                All your courses are above 75%.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="mt-6 mx-6 dark:text-white">
        <div className="flex flex-row justify-between items-center mb-2">
          <h2 className="font-bold text-xl">Today’s Schedule</h2>
        </div>

        <TodaySubject />
      </section>
    </main>
  );
};

export default Page;
