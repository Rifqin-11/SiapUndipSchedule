"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import ScheduleSkeleton from "@/components/schedule/ScheduleSkeleton";

// Dynamic import untuk ScheduleClient yang berat
const ScheduleClient = dynamic(
  () => import("@/components/schedule/ScheduleClient"),
  {
    loading: () => <ScheduleSkeleton />,
    ssr: false, // Client-side only karena banyak interactive components
  }
);

const Page = () => {
  return (
    <div className="">
      <Suspense fallback={<ScheduleSkeleton />}>
        <ScheduleClient />
      </Suspense>
    </div>
  );
};

export default Page;
