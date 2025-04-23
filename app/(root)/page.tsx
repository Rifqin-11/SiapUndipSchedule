import React from "react";
import { BellPlus } from "lucide-react";
import CoursesCard from "@/components/CoursesCard";
import TodayCard from "@/components/TodayCard";
import { dummySubject } from "@/constants";
import { getCurrentDayAndDate } from "@/utils/date";
import { colorPairs } from "@/utils/date";

const MAX_MEETING = 14;

const page = () => {
  const { currentDay, currentDate } = getCurrentDayAndDate();

  const todaySubject = dummySubject.filter(
    (subject) => subject.day.toLowerCase() === currentDay.toLowerCase()
  );

  const allMeetingsSafe = dummySubject.every(
    (subject) => (subject.meeting / MAX_MEETING) * 100 >= 75
  );

  return (
    <main className="animate-fadeIn">
      <section className="flex flex-col mt-6 mx-6 text-lg dark:text-white space-y-1">
        <h1 className="text-xl font-extrabold tracking-tight">
          Hi, here’s your schedule
        </h1>
        <p className="text-sm text-muted-foreground">
          {currentDay}, {currentDate}
        </p>
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

        <div className="flex flex-col gap-4">
          {todaySubject.length > 0 ? (
            todaySubject.map((subject) => {
              const randomColor =
                colorPairs[Math.floor(Math.random() * colorPairs.length)];
              return (
                <TodayCard
                  {...subject}
                  key={subject.id}
                  bgColor={randomColor.bg}
                  textColor={randomColor.text}
                  bgRoomColor={randomColor.roomBg}
                />
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
      </section>
    </main>
  );
};

export default page;
