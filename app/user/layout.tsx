import { UserRound } from "lucide-react";
import React, { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <section className="flex flex-row gap-2 items-center pt-4 pb-2 mx-5">
        <div className="flex flex-row justify-center items-center w-full">
          <div className="flex flex-col gap-0.5 justify-center text-center">
            <div className="flex items-center justify-center gap-2">
              <UserRound className="w-6 h-6 text-blue-600" />
              <h1 className="font-bold text-xl text-gray-900 dark:text-white">
                Akun Saya
              </h1>
            </div>
          </div>
        </div>
      </section>

      <main className="pb-20">{children}</main>
    </div>
  );
};

export default Layout;
