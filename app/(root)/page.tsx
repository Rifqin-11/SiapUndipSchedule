import React from "react";
import Image from "next/image";
import { BellPlus } from "lucide-react";
import CategoryCard from "@/components/CategoryCard";
import TodayCard from "@/components/TodayCard";
import { dummySubject } from "@/constants";
import { getCurrentDayAndDate } from "@/utils/date";
import { colorPairs } from "@/utils/date";


const page = () => {
  const { currentDay, currentDate } = getCurrentDayAndDate();

  const todaySubject = dummySubject.filter(
    (subject) => subject.day === currentDay
  );

  return (
    <>
      <section className="flex mt-3 mx-5 text-lg dark:text-white">
        This is your schedule
      </section>

      <section className="mt-4 dark:text-white">
        <div className="flex flex-row justify-between items-center mx-5">
          <h1 className="font-black">Schedule Category</h1>
          <p className="text-xs text-gray-700 dark:text-gray-300">View more</p>
        </div>

        <div className="mt-3 overflow-x-auto scrollbar-none px-5">
          <div className="flex gap-4">
            {dummySubject.map((subject) => (
              <CategoryCard {...subject} key={subject.id} />
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 mx-5 dark:text-white">
        <div className="flex flex-row justify-between items-center">
          <h1 className="font-black">Today Schedule</h1>
          <p className="text-xs text-gray-700"></p>
        </div>

        <div className="flex flex-col mt-3 gap-4">
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
              <h1 className="font-bold text-lg text-gray-700 dark:text-gray-300">
                No Schedule Today
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                You have no schedule today
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default page;
