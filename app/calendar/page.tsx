import HorizonalCalendar from "@/components/HorizonalCalendar";
import { dummySubject } from "@/constants";
import { getCurrentDayAndDate } from "@/utils/date";
import React from "react";

const page = () => {
    const {currentDay, currentDate} = getCurrentDayAndDate();

    const todaySubject = dummySubject.filter(
      (subject) => subject.day === currentDay
    );

  return (
    <>
      <HorizonalCalendar />

      <section className="mt-6">
        <div>
          <h1 className="font-bold">Academic Schedule</h1>
        </div>
      </section>
    </>
  );
};

export default page;
