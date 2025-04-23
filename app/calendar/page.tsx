import CalendarCard from "@/components/CalendarCard";
import HorizonalCalendar from "@/components/HorizonalCalendar";
import { dummySubject } from "@/constants";
import { getCurrentDayAndDate } from "@/utils/date";
import React from "react";
import { colorPairs } from "@/utils/date";

const page = () => {
  const { currentDay, currentDate } = getCurrentDayAndDate();

  const todaySubject = dummySubject.filter(
    (subject) => subject.day === currentDay
  );

  return (
    <>
      <div className="mx-5">
        <HorizonalCalendar />
      </div>

      <section className="mt-6 ">
        <div className="mx-5">
          <h1 className="font-bold">Academic Schedule</h1>
        </div>

        {todaySubject.length > 0 ? (
          todaySubject.map((subject) => {
            const randomColor =
              colorPairs[Math.floor(Math.random() * colorPairs.length)];
            return (
              <CalendarCard
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
            <h1 className="font-bold text-lg text-gray-700 dark:text-gray-300">
              No Schedule Today
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              You have no schedule today
            </p>
          </div>
        )}
      </section>
    </>
  );
};

export default page;
