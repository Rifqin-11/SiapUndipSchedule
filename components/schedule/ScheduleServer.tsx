import React from "react";
import PageHeader from "@/components/PageHeader";
import CalendarCard from "@/components/schedule/CalendarCard";
import { Subject } from "@/hooks/useSubjects";
import { colorPairs } from "@/utils/date";

interface Props {
  subjects: Subject[];
}

export default function ScheduleServer({ subjects = [] }: Props) {
  // Simple server-rendered list grouped by day (default: today)
  return (
    <div className="min-h-screen bg-background">
      <PageHeader variant="calendar" />

      <div className="pt-15 lg:pt-0 mx-5">
        {/* Server-rendered static calendar placeholder: keep lightweight */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-bold">Academic Schedule</h1>
        </div>
      </div>

      <section className="mt-6">
        <div className="space-y-4 mx-5">
          {subjects.length > 0 ? (
            subjects.map((subject, index) => {
              const colorIndex = subject.id
                ? subject.id
                    .split("")
                    .reduce((acc, char) => acc + char.charCodeAt(0), 0) %
                  colorPairs.length
                : index % colorPairs.length;
              const assignedColor = colorPairs[colorIndex];

              return (
                // CalendarCard is safe to render on server (pure presentation)
                <div key={subject.id}>
                  <CalendarCard
                    {...subject}
                    bgColor={assignedColor.bg}
                    textColor={assignedColor.text}
                    bgRoomColor={assignedColor.roomBg}
                    selectedDate={subject.specificDate}
                    showActions={false} // server render: no interactive actions
                  />
                </div>
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
        </div>
      </section>
    </div>
  );
}
