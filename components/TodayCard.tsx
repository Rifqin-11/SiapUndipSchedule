import React from "react";

const TodayCard = ({
  name,
  room,
  startTime,
  endTime,
  lecturer,
  category,
  bgColor,
  textColor,
  bgRoomColor,
}: subject & { bgColor: string; textColor: string; bgRoomColor: string }) => {
  return (
    <div
      className={`flex flex-col ${bgColor} justify-around rounded-3xl p-3 w-full min-h-35`}
    >
      <div className="flex flex-row mt-2 justify-between items-center">
        <h1 className={`font-black text-lg max-w-50 ${textColor}`}>{name}</h1>
        <div className={`text-xs text-right ${textColor}`}>
          {lecturer.map((lecturer, index) => (
            <p key={index}>{lecturer}</p>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-row justify-between items-center">
        <div className={textColor}>
          <h1 className="font-bold">{startTime}</h1>
          <p className="text-xs">Start</p>
        </div>
        <div
          className={`${bgRoomColor} p-1 px-5 rounded-3xl font-bold flex justify-center items-center  text-white`}
        >
          {room}
        </div>
        <div className={textColor}>
          <h1 className="font-bold">{endTime}</h1>
          <p className="text-xs">End</p>
        </div>
      </div>
    </div>
  );
};



export default TodayCard;
