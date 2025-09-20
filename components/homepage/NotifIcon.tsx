"use client";

import React, { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { useSubjects } from "@/hooks/useSubjects";
import { formatLocalDate } from "@/utils/date";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface MissedClass {
  id: string;
  name: string;
  room: string;
  startTime: string;
  endTime: string;
  day: string;
  date: string;
}

const NotifIcon = () => {
  const { data: subjects = [] } = useSubjects();
  const [missedClasses, setMissedClasses] = useState<MissedClass[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Set client-side flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check for missed classes
  useEffect(() => {
    if (!isClient || !subjects.length) return;

    const checkMissedClasses = async () => {
      const now = new Date();
      const today = formatLocalDate(now);
      const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes

      try {
        // Get attendance status for today from database
        const response = await fetch(`/api/attendance-status?date=${today}`);
        let attendanceStatus: Record<string, boolean> = {};

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            attendanceStatus = data.attendanceStatus;
          }
        }

        const missed: MissedClass[] = [];

        subjects.forEach((subject) => {
          // Skip subjects without valid schedule
          if (!subject.day || !subject.startTime || !subject.endTime) return;

          // Get day name
          const dayNames = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ];
          const todayName = dayNames[now.getDay()];

          // Only check for today's classes
          if (subject.day !== todayName) return;

          // Parse end time
          const [endHour, endMinute] = subject.endTime.split(":").map(Number);
          const endTimeInMinutes = endHour * 60 + endMinute;

          // Check if class has ended
          if (currentTime > endTimeInMinutes) {
            // Check attendance status from database first, fallback to localStorage
            const hasAttendedInDB = attendanceStatus[subject.id] === true;
            const attendanceKey = `attended_${subject.id}_${today}`;
            const hasAttendedLocal =
              localStorage.getItem(attendanceKey) === "true";
            const hasAttended = hasAttendedInDB || hasAttendedLocal;

            // If attended in DB but not in localStorage, sync it
            if (hasAttendedInDB && !hasAttendedLocal) {
              localStorage.setItem(attendanceKey, "true");
            }

            if (!hasAttended) {
              // Check if this missed class notification was already dismissed
              const dismissKey = `dismissed_${subject.id}_${today}`;
              const wasDismissed = localStorage.getItem(dismissKey) === "true";

              if (!wasDismissed) {
                missed.push({
                  id: subject.id,
                  name: subject.name,
                  room: subject.room,
                  startTime: subject.startTime,
                  endTime: subject.endTime,
                  day: subject.day,
                  date: today,
                });
              }
            }
          }
        });

        setMissedClasses(missed);
      } catch (error) {
        console.warn("Error checking missed classes:", error);
        // Fallback to localStorage-only check on error
        checkMissedClassesLocal();
      }
    };

    // Fallback function that only uses localStorage (original logic)
    const checkMissedClassesLocal = () => {
      const now = new Date();
      const today = formatLocalDate(now);
      const currentTime = now.getHours() * 60 + now.getMinutes();

      const missed: MissedClass[] = [];

      subjects.forEach((subject) => {
        if (!subject.day || !subject.startTime || !subject.endTime) return;

        const dayNames = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        const todayName = dayNames[now.getDay()];

        if (subject.day !== todayName) return;

        const [endHour, endMinute] = subject.endTime.split(":").map(Number);
        const endTimeInMinutes = endHour * 60 + endMinute;

        if (currentTime > endTimeInMinutes) {
          const attendanceKey = `attended_${subject.id}_${today}`;
          const hasAttended = localStorage.getItem(attendanceKey) === "true";

          if (!hasAttended) {
            const dismissKey = `dismissed_${subject.id}_${today}`;
            const wasDismissed = localStorage.getItem(dismissKey) === "true";

            if (!wasDismissed) {
              missed.push({
                id: subject.id,
                name: subject.name,
                room: subject.room,
                startTime: subject.startTime,
                endTime: subject.endTime,
                day: subject.day,
                date: today,
              });
            }
          }
        }
      });

      setMissedClasses(missed);
    };

    // Check immediately
    checkMissedClasses();

    // Check every minute
    const interval = setInterval(checkMissedClasses, 60000);

    return () => clearInterval(interval);
  }, [subjects, isClient]);

  const dismissNotification = (classId: string, date: string) => {
    const dismissKey = `dismissed_${classId}_${date}`;
    localStorage.setItem(dismissKey, "true");

    // Remove from missed classes
    setMissedClasses((prev) =>
      prev.filter((missed) => !(missed.id === classId && missed.date === date))
    );
  };

  const dismissAllNotifications = () => {
    missedClasses.forEach((missed) => {
      const dismissKey = `dismissed_${missed.id}_${missed.date}`;
      localStorage.setItem(dismissKey, "true");
    });
    setMissedClasses([]);
  };

  if (!isClient) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative p-2">
          <Bell className="h-5 w-5" />
          {missedClasses.length > 0 && (
            <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-medium">
              {missedClasses.length}
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Missed Classes</span>
          {missedClasses.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={dismissAllNotifications}
              className="text-xs h-6 px-2"
            >
              Clear All
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {missedClasses.length === 0 ? (
          <DropdownMenuItem disabled className="py-4 text-center">
            <div className="flex flex-col items-center justify-center text-center space-y-2">
              <Bell className="h-8 w-8 text-gray-400" />
              <span className="text-sm text-gray-500">No missed classes</span>
            </div>
          </DropdownMenuItem>
        ) : (
          missedClasses.map((missed) => (
            <DropdownMenuItem
              key={`${missed.id}-${missed.date}`}
              className="flex-col items-start p-4 space-y-2"
              onClick={(e) => e.preventDefault()}
            >
              <div className="flex justify-between items-start w-full">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{missed.name}</h4>
                  <p className="text-xs text-gray-500">
                    {missed.startTime} - {missed.endTime} • {missed.room}
                  </p>
                  <p className="text-xs text-red-500 mt-1">
                    You missed this class attendance
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissNotification(missed.id, missed.date)}
                  className="h-6 w-6 p-0 ml-2"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotifIcon;
