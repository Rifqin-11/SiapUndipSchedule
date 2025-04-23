import React from "react";

const TodayCard = ({
  name,
  room,
  startTime,
  endTime,
  lecturer,
  category,
}: subject) => {
  return (
    <div className="flex flex-col bg-blue-100 justify-around rounded-3xl p-3 w-full min-h-35">
      <div className="flex flex-row mt-2 justify-between items-center jus">
        <h1 className="font-black text-cyan-700 text-lg max-w-50">{name}</h1>
        <div className="text-xs text-cyan-700 text-right">
          {lecturer.map((lecturer, index) => (
            <p key={index}>{lecturer}</p>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-row justify-between items-center">
        <div>
          <h1 className="font-bold text-cyan-700">{startTime}</h1>
          <p className="text-xs text-cyan-700">Start</p>
        </div>
        <div className="bg-cyan-700 p-1 px-5 rounded-3xl text-blue-100 font-bold flex justify-center items-center">
          {room}
        </div>
        <div>
          <h1 className="font-bold text-cyan-700">{endTime}</h1>
          <p className="text-xs text-cyan-700">End</p>
        </div>
      </div>
    </div>
  );
};

export default TodayCard;
