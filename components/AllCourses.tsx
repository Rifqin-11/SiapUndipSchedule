import React from "react";
import { Progress } from "./ui/progress";
import { colorPairs } from "@/utils/date";

const AllCourses = ({ name, category, meeting,  }: subject) => {
  const proggressMeeting = (meeting / 14) * 100;

  return (
    <div className="flex flex-col bg-white border-1 justify-around rounded-lg p-2 px-3 min-w-[260px] max-w-[260px] gap-2 shadow-md">
      {}
      <div className="flex bg-blue-100 text-blue-900 p-0.5 rounded-xl max-w-15 items-center justify-center text-xs">
        {proggressMeeting < 75 ? (
          <h1 className="font-bold">High</h1>
        ) : (
          <h1 className="font-bold text-green-900">Low</h1>
        )}
      </div>

      <div className="flex max-w-60">
        <h1 className="font-black text-blue-900 text">{name}</h1>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex flex-row justify-between text-xs text-gray-600">
          <h1>progress</h1>
          <p className="text-blue-900">{meeting}/14</p>
        </div>
        <div>
          <Progress value={proggressMeeting} />
        </div>
      </div>
    </div>
  );
};

export default AllCourses;
