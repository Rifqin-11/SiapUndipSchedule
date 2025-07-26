import BackButton from "@/components/Back-Button";
import { Settings } from "lucide-react";
import React, { ReactNode } from "react";

const layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="">
      <section className="flex flex-row gap-2 items-center mt-4 mb-2 mx-5">
        <BackButton />
        <div className="flex flex-row justify-center items-center w-full">
          <div className="flex flex-col gap-0.5 justify-center text-center">
            <h1 className="font-bold text-xl">Kelola Mata Kuliah</h1>
          </div>
        </div>
        <div>
          <Settings />
        </div>
      </section>

      {children}
    </div>
  );
};

export default layout;
