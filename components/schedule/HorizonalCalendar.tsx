import React, { useState, useEffect } from "react";
import { getCurrentDayAndDate, formatLocalDate } from "@/utils/date";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  selectedDay?: string; // Make optional for backward compatibility
  onDaySelect: (day: string, date?: string) => void; // Add date parameter
  onWeekChange?: (weekOffset: number) => void; // Add week change callback
};

const HorizonalCalendar = ({ onDaySelect, onWeekChange }: Props) => {
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, 1 = next week, -1 = previous week
  const [selectedDate, setSelectedDate] = useState<string | null>(null); // Track selected date specifically
  const { currentDate } = getCurrentDayAndDate();

  // Initialize selectedDate to today on component mount
  useEffect(() => {
    const today = formatLocalDate(new Date());
    setSelectedDate(today);
  }, []);

  // Function to get week dates with offset
  const getWeekDatesWithOffset = (offset: number = 0) => {
    const today = new Date();
    const currentDayIndex = today.getDay();
    const daysSinceMonday = (currentDayIndex + 6) % 7;

    const monday = new Date(today);
    monday.setDate(today.getDate() - daysSinceMonday + offset * 7);

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const week = [...Array(7)].map((_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);

      return {
        day: days[i],
        date: date.getDate(),
        isToday: date.toDateString() === today.toDateString(),
        fullDate: date,
      };
    });

    return week;
  };

  const weekDates = getWeekDatesWithOffset(weekOffset);

  const goToPreviousWeek = () => {
    setWeekOffset((prev) => {
      const newOffset = prev - 1;
      onWeekChange?.(newOffset);
      return newOffset;
    });
  };

  const goToNextWeek = () => {
    setWeekOffset((prev) => {
      const newOffset = prev + 1;
      onWeekChange?.(newOffset);
      return newOffset;
    });
  };

  const goToCurrentWeek = () => {
    setWeekOffset(0);
    onWeekChange?.(0);
  };

  // Function to get display text for the header
  const getDisplayText = () => {
    if (weekOffset === 0) {
      return currentDate; // Show full current date when viewing current week
    } else {
      // Show month name when viewing different weeks
      const weekDates = getWeekDatesWithOffset(weekOffset);
      const weekStartDate = weekDates[0].fullDate;
      const weekEndDate = weekDates[6].fullDate;

      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      // Alternative: Indonesian month names
      // const monthNames = [
      //   "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      //   "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      // ];

      // If week spans across two months, show the month that has more days in the week
      if (weekStartDate.getMonth() !== weekEndDate.getMonth()) {
        // Count days in each month for this week
        const startMonth = weekStartDate.getMonth();
        const endMonth = weekEndDate.getMonth();

        let startMonthDays = 0;
        let endMonthDays = 0;

        weekDates.forEach((day) => {
          if (day.fullDate.getMonth() === startMonth) {
            startMonthDays++;
          } else if (day.fullDate.getMonth() === endMonth) {
            endMonthDays++;
          }
        });

        // Return the month with more days
        return startMonthDays >= endMonthDays
          ? monthNames[startMonth]
          : monthNames[endMonth];
      } else {
        // Same month for the entire week
        return monthNames[weekStartDate.getMonth()];
      }
    }
  };

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
        <div className="flex justify-between mt-6">
          <div className="text-lg font-bold text-start flex-1">
            <h1
              className={`cursor-pointer hover:text-blue-600 transition-colors ${
                weekOffset !== 0 ? "text-blue-500" : ""
              }`}
              onClick={goToCurrentWeek}
              title={weekOffset !== 0 ? "Click to return to current week" : ""}
            >
              {getDisplayText()}
            </h1>
            {weekOffset !== 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {weekOffset > 0
                  ? `+${weekOffset} week${weekOffset > 1 ? "s" : ""} from today`
                  : `${weekOffset} week${
                      weekOffset < -1 ? "s" : ""
                    } from today`}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={goToPreviousWeek}
              className="p-2 border border-blue-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={goToNextWeek}
              className="p-2 border border-blue-100"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="flex flex-row gap-2 justify-around items-center">
          {weekDates.map((day, index) => {
            const fullDay = dayNameMap[day.day];
            const dateString = formatLocalDate(day.fullDate); // YYYY-MM-DD format

            // Check if this specific date is selected (not just the day name)
            const isSelected = selectedDate === dateString;

            return (
              <div
                key={index}
                onClick={() => {
                  setSelectedDate(dateString);
                  onDaySelect(fullDay, dateString);
                }}
                className={`text-center p-2 cursor-pointer transition-all ${
                  isSelected
                    ? "bg-blue-100 text-blue-500 rounded-xl dark:bg-blue-900 dark:text-blue-100"
                    : day.isToday
                    ? "text-blue-500 rounded-xl"
                    : "hover:bg-blue-100 rounded-xl dark:hover:bg-blue-900 dark:hover:text-blue-100"
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
