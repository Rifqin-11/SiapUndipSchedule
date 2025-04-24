import { dummySubject } from "@/constants";
import { notFound } from "next/navigation";
import { Clock, Locate, PinIcon } from "lucide-react";
import React from "react";
import { p } from "framer-motion/client";

const page = ({ params }: { params: { id: string } }) => {
  const subject = dummySubject.find((item) => item.id === params.id);

  if (!subject) return notFound();

  return (
    <div className="flex flex-col mx-5 mt-6 gap-4">
      {subject.category && (
        <div className="bg-red-200 rounded w-15 text-center font-bold">High</div>
      )}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="font-bold text-xl">{subject.name}</h1>
          <p className="text-justify mt-2">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Sint
            exercitationem soluta, commodi fugiat autem officia natus laborum
            doloremque iusto excepturi dolores dolorem, cum aspernatur, iure
            laudantium obcaecati earum officiis voluptates?
          </p>
        </div>

        <div>
          <h1 className="font-bold">Lecturer</h1>
          <div className="flex flex-col gap-1">
            {subject.lecturer.map((lect, index) => (
              <p key={index}>{lect}</p>
            ))}
          </div>
        </div>

        <div>
          <h1 className="font-bold">Date:</h1>
          <div className="flex flex-row justify-around mt-2">
            <div className="flex flex-row gap-2 items-center justify-center">
              <Clock className="" />
              <div className="flex flex-col">
                <p className="text-xs">Dates:</p>
                <h1 className="font-bold">
                  {subject.startTime} - {subject.endTime}
                </h1>
              </div>
            </div>
            <div className="flex flex-row gap-2 items-center justify-center">
              <PinIcon />
              <div className="flex flex-col">
                <p className="text-xs">Room:</p>
                <h1 className="font-bold">{subject.room}</h1>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
