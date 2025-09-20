"use client";

import dynamic from "next/dynamic";
import React from "react";

const ScheduleClient = dynamic(() => import("./ScheduleClient"), {
  ssr: false,
  loading: () => <div />,
});

export default function ScheduleLoader(props: any) {
  return <ScheduleClient {...props} />;
}
