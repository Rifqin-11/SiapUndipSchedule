import { Settings } from "lucide-react";
import React, { ReactNode } from "react";

const layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <section className="flex flex-row gap-2 items-center pt-4 pb-2 mx-5">
        <div className="flex flex-row justify-center items-center w-full">
          <div className="flex flex-col gap-0.5 justify-center text-center">
            <div className="flex items-center justify-center gap-2">
              <Settings className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              <h1 className="font-bold text-xl text-gray-900 dark:text-white">
                Settings
              </h1>
            </div>
          </div>
        </div>
      </section>

      <main className="pb-20">{children}</main>
    </div>
  );
};

export default layout;
