"use client"

import { dummySubject } from '@/constants';
import { colorPairs, getCurrentDayAndDate } from '@/utils/date';
import Link from 'next/link';
import React from 'react'
import TodayCard from './TodayCard';

const TodaySubject = () => {
  const { currentDay, currentDate } = getCurrentDayAndDate();

    const todaySubject = dummySubject.filter(
      (subject) => subject.day.toLowerCase() === currentDay.toLowerCase()
    );
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
}

export default TodaySubject
