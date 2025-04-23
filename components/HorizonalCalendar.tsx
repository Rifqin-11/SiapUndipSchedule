import React from "react";
import { getCurrentDayAndDate, getWeekDates } from "@/utils/date";

type Props = {
  selectedDay: string;
  onDaySelect: (day: string) => void;
};

const HorizonalCalendar = ({ selectedDay, onDaySelect }: Props) => {
  const { currentDate } = getCurrentDayAndDate();
  const weekDates = getWeekDates();

  const dayNameMap: Record<string, string> = {
    Mon: "Monday",
    Tue: "Tuesday",
    Wed: "Wednesday",
    Thu: "Thursday",
    Fri: "Friday",
    Sat: "Saturday",
    Sun: "Sunday",
  };

  return (
    <div>
      <div className="flex flex-col gap-4">
        <div className="text-lg font-bold mt-6">
          <h1>{currentDate}</h1>
        </div>
        <div className="flex flex-row gap-2 justify-around items-center">
          {weekDates.map((day, index) => {
            const fullDay = dayNameMap[day.day];
            return (
              <div
                key={index}
                onClick={() => onDaySelect(fullDay)}
                className={`text-center p-2 cursor-pointer transition-all ${
                  fullDay === selectedDay
                    ? "bg-blue-100 text-blue-500 rounded-xl"
                    : day.isToday
                    ? "text-blue-500 rounded-xl"
                    : "hover:bg-blue-100 rounded-xl"
                }`}
              >
                <p className="text-sm">{day.day}</p>
                <h1 className="font-bold">{day.date}</h1>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HorizonalCalendar;
