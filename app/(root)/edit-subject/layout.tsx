import BackButton from "@/components/Back-Button";
import { Edit3 } from "lucide-react";
import React, { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="">
      <section className="flex flex-row gap-2 items-center mt-4 mb-2 mx-5">
        <BackButton />
        <div className="flex flex-row justify-center items-center w-full">
          <div className="flex flex-col gap-0.5 justify-center text-center">
            <div className="flex items-center justify-center gap-2">
              <Edit3 className="w-5 h-5 text-blue-600" />
              <h1 className="font-bold text-xl">Edit Mata Kuliah</h1>
            </div>
          </div>
        </div>
      </section>

      {children}
    </div>
  );
};

export default Layout;
