import React from 'react'
import { Progress } from './ui/progress'

const CalendarCard = ({
  name,
  room,
  startTime,
  endTime,
  lecturer,
  bgColor,
  textColor,
  bgRoomColor,
  meeting,
}: subject & { bgColor: string; textColor: string; bgRoomColor: string }) => {
  return (
    <div className="flex flex-row gap-4 mt-2">
      <div className="flex flex-row w-full p-2 gap-1">
        <div className="flex flex-col justify-between text-xs">
          <h1>{startTime}</h1>
          <h1>{endTime}</h1>
        </div>
        <div
          className={`flex flex-col justify-around ${bgColor} w-full rounded-xl px-4 py-2`}
        >
          <div className="flex flex-row gap-2 justify-between items-center">
            <h1 className={`font-bold ${textColor}`}>{name}</h1>
            <div
              className={`bg-white/60 rounded-lg p-1 px-2 text-xs ${textColor}`}
            >
              {room}
            </div>
          </div>
          <div className="mt-3">
            {lecturer.map((lecturer, index) => (
              <p
                key={index}
                className={`text-xs ${textColor} truncate overflow-hidden whitespace-nowrap max-w-[140px]`}
              >
                {lecturer}
              </p>
            ))}
          </div>
          <div className="flex flex-col mt-3 gap-1">
            <div className="flex flex-row justify-between items-center">
              <h1 className="text-xs text-gray-500">Progress</h1>
              <p className="text-xs text-gray-500">{meeting}/14</p>
            </div>
            <Progress value={50} className="bg-blue-200" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarCard
