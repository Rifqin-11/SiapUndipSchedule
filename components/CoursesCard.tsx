import React from "react";
import { Progress } from "./ui/progress";

type Subject = {
  name: string;
  meeting: number;
};

const CoursesCard = ({ name, meeting }: Subject) => {
  const progressMeeting = (meeting / 14) * 100;

  return (
    <div className="flex flex-col bg-white dark:bg-card border rounded-xl shadow-md p-3 max-h-[150px] gap-4">
      <div className="bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full text-xs font-semibold w-fit">
        {progressMeeting < 75 ? (
          "High"
        ) : (
          <span className="text-green-900">Low</span>
        )}
      </div>

      <div className="text-blue-900 dark:text-white font-bold text-base leading-snug line-clamp-2">
        {name}
      </div>

      <div className="flex flex-col gap-1 mt-1">
        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300">
          <span>Progress</span>
          <span className="text-blue-900 dark:text-blue-400">{meeting}/14</span>
        </div>
        <Progress value={progressMeeting} className="bg-blue-100" />
      </div>
    </div>
  );
};

export default CoursesCard;
