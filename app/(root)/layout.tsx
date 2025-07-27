import NotifIcon from "@/components/NotifIcon";
import Image from "next/image";
import React, {  ReactNode } from "react";

const page = ({ children }: { children: ReactNode }) => {
  return (
    <div className="">
      <section className="flex flex-row gap-2 items-center mt-4 mx-5">
        <div className="flex flex-row justify-between items-center w-full">
          <div className="flex flex-row gap-2 items-center">
            <Image
              src="/ProfilePicture.jpg"
              alt="Profile Picture"
              width={30}
              height={30}
              className="rounded-full size-10"
            />
            <div>
              <h1 className="font-bold">Rifqi Naufal</h1>
              <p className="text-xs text-gray-800">Welcome Back!</p>
            </div>
          </div>
          <div>
            <NotifIcon />
          </div>
        </div>
      </section>

      {children}
    </div>
  );
};

export default page;
