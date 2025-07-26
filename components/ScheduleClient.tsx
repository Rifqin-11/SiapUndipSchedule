"use client";

import React, { useState } from "react";
import { getCurrentDayAndDate, colorPairs } from "@/utils/date";
import HorizonalCalendar from "@/components/HorizonalCalendar";
import CalendarCard from "@/components/CalendarCard";
import Link from "next/link";
import { useSubjects } from "@/hooks/useSubjects";

const ScheduleClient = () => {
  const { currentDay } = getCurrentDayAndDate();
  const [selectedDay, setSelectedDay] = useState(currentDay);
  const { subjects, loading, error } = useSubjects();

  const filteredSubjects = subjects.filter(
    (subject) => subject.day === selectedDay
  );

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
        <h1 className="font-bold text-lg text-red-600">Error</h1>
        <p className="text-xs text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mx-5">
        <HorizonalCalendar
          selectedDay={selectedDay}
          onDaySelect={setSelectedDay}
        />
      </div>

      <section className="mt-6">
        <div className="mx-5">
          <h1 className="font-bold">Academic Schedule</h1>
        </div>

        {filteredSubjects.length > 0 ? (
          filteredSubjects.map((subject) => {
            const randomColor =
              colorPairs[Math.floor(Math.random() * colorPairs.length)];
            return (
              <Link href={`/subject-detail/${subject.id}`} key={subject.id}>
                <CalendarCard
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
            <h1 className="font-bold text-lg text-gray-700 dark:text-gray-300">
              No Schedule
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              You have no class on this day
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default ScheduleClient;
