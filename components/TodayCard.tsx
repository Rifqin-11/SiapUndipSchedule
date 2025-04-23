import React from "react";

const TodayCard = () => {
  return (
    <div className="bg-blue-100 rounded-3xl p-3 w-full">
      <div className="flex flex-row mt-2 justify-between items-center jus">
        <h1 className="font-black text-cyan-700 text-lg max-w-40">
          Keamanan Jaringan
        </h1>
        <div className="text-xs text-cyan-700 text-right">
          <p>Ir. M. Arfan S.T, M.T</p>
          <p>Yoshua Alfin, S.T M.T</p>
        </div>
      </div>

      <div className="mt-3 flex flex-row justify-between items-center">
        <div>
          <h1 className="font-bold text-cyan-700">10:00 PM</h1>
          <p className="text-xs text-cyan-700">Start</p>
        </div>
        <div className="bg-cyan-700 p-1 px-5 rounded-3xl text-blue-100 font-bold flex justify-center items-center">
          B.206
        </div>
        <div>
          <h1 className="font-bold text-cyan-700">11:50 PM</h1>
          <p className="text-xs text-cyan-700">End</p>
        </div>
      </div>
    </div>
  );
};

export default TodayCard;
