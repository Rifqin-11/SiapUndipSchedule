import { dummySubject } from '@/constants';
import { getCurrentDayAndDate, getWeekDates } from '@/utils/date';
import React from 'react'


const HorizonalCalendar = () => {
  const {currentDay, currentDate} = getCurrentDayAndDate();
  const weekDates = getWeekDates();

  return (
    <div>
        <div className="flex flex-col gap-4">
          <div className="text-lg font-bold mt-6">
            <h1>{currentDate}</h1>
          </div>
          <div className="flex flex-row gap-2 justify-around items-center">
            {weekDates.map((day, index) => (
              <div className={`text-center p-2 ${day.isToday ? 'bg-blue-100 rounded-xl' : ''}`} key={index}>
                <p className='text-sm'>{day.day}</p>
                <h1 className="font-bold">{day.date}</h1>
              </div>
            ))}
          </div>
        </div>
    </div>
  );
}

export default HorizonalCalendar
