import React from "react";
import { Progress } from "./ui/progress";

const CategoryCard = () => {
  return (
    <div className="flex flex-col bg-pink-200 rounded-lg p-2 px-3 min-w-[260px] max-w-[260px] gap-2">
      <div className="flex bg-pink-100 text-pink-900 p-0.5 rounded-xl max-w-15 items-center justify-center text-xs">
        High
      </div>

      <div className="flex max-w-60">
        <h1 className="font-black text-pink-900 text">Metoda Pemrograman Modern</h1>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex flex-row justify-between text-xs text-gray-600">
          <h1>progress</h1>
          <p className="text-pink-900">30%</p>
        </div>
        <div>
          <Progress value={30} />
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;
