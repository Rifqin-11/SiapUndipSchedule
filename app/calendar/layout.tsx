import Image from 'next/image';
import React, { ReactNode } from 'react'

const layout = ({children }: {children: ReactNode}) => {
  return (
    <div className=" mx-5">
      <section className="flex flex-row gap-2 items-center mt-4 mb-2">
        <div className="flex flex-row justify-between items-center w-full">
          <div className="flex flex-col gap-0.5 justify-center">
            <h1 className="font-bold text-xl">Calendar</h1>
            <p className="text-xs">You have 4 subject today!</p>
          </div>
          <div className="flex flex-row gap-2 items-center">
            <Image
              src="/ProfilePicture.jpg"
              alt="Profile Picture"
              width={30}
              height={30}
              className="rounded-full size-10"
            />
          </div>
        </div>
      </section>

      {children}
    </div>
  );
}

export default layout
