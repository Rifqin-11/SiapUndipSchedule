import React from "react";
import CoursesCard from "@/components/CoursesCard";
import { dummySubject } from "@/constants";
import TodaySubject from "@/components/TodaySubject";
import CurrentDayDate from "@/components/CurrentDayDate";

const MAX_MEETING = 14;

const page = () => {
  const allMeetingsSafe = dummySubject.every(
    (subject) => (subject.meeting / MAX_MEETING) * 100 >= 75
  );

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
              dummySubject.map((subject) => (
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

export default page;
