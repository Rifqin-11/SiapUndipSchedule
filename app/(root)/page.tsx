import React from "react";
import Image from "next/image";
import { BellPlus } from "lucide-react";
import CategoryCard from "@/components/CategoryCard";
import TodayCard from "@/components/TodayCard";

const page = () => {
  return (
    <>
      <section className="flex mt-3 mx-5 text-lg">
        This is your schedule
      </section>

      <section className="mt-4">
        <div className="flex flex-row justify-between items-center mx-5">
          <h1 className="font-black ">Schedule Category</h1>
          <p className="text-xs text-gray-700">View more</p>
        </div>

        <div className="mt-3 overflow-x-auto scrollbar-none px-5">
          <div className="flex gap-4">
            <CategoryCard />
            <CategoryCard />
          </div>
        </div>
      </section>

      <section className="mt-8 mx-5">
        <div className="flex flex-row justify-between items-center">
          <h1 className="font-black ">Today Schedule</h1>
          <p className="text-xs text-gray-700">View more</p>
        </div>

        <div className="flex flex-col mt-3 gap-4">
          <TodayCard />
          <TodayCard />
          <TodayCard />
        </div>
      </section>
    </>
  );
};

export default page;
