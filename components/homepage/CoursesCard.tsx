import React from "react";
import Link from "next/link";
import { Progress } from "../ui/progress";

type Subject = {
  id?: string;
  _id?: string;
  name: string;
  meeting: number;
  specificDate?: string; // If this exists, it means it's not repeating weekly
};

const CoursesCard = ({ id, _id, name, meeting, specificDate }: Subject) => {
  // If specificDate exists, it means this subject is not repeating weekly, so progress should be 0
  const progressMeeting = specificDate ? 0 : (meeting / 14) * 100;
  const maxMeetings = specificDate ? 1 : 14; // One-time subjects have max 1 meeting
  const subjectId = id || _id;

  const cardContent = (
    <div className="flex flex-col bg-white dark:bg-card border rounded-xl shadow-md p-3 max-h-[150px] gap-4 hover:shadow-lg transition-shadow duration-200 cursor-pointer">
      <div className="bg-blue-100 dark:bg-blue-900 dark:text-blue-100 text-blue-900 px-2 py-0.5 rounded-full text-xs font-semibold w-fit">
        {specificDate ? (
          "One-time"
        ) : progressMeeting < 75 ? (
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
          <span className="text-blue-900 dark:text-blue-400">
            {meeting}/{maxMeetings}
          </span>
        </div>
        <Progress
          value={progressMeeting}
          className="bg-blue-100 dark:bg-gray-800"
        />
      </div>
    </div>
  );

  // If we have an ID, wrap with Link, otherwise just return the card
  if (subjectId) {
    return (
      <Link href={`/subject-detail/${subjectId}`} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};

export default CoursesCard;
