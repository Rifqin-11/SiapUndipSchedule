"use client";

import { notFound } from "next/navigation";
import { Clock, PinIcon } from "lucide-react";
import React, { use } from "react";
import Timeline from "@/components/Timeline";
import { useSubject } from "@/hooks/useSubjects";

const Page = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const { subject, loading, error } = useSubject(id);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-4">
        <div className="text-red-600 text-lg font-semibold">{error}</div>
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Kembali
        </button>
      </div>
    );
  }

  if (!subject) {
    return notFound();
  }

  return (
    <div className="flex flex-col mx-5 mt-6 gap-4">
      {subject.category && (
        <div className="bg-red-200 rounded w-15 text-center font-bold">
          High
        </div>
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

        <div className="mt-4">
          <Timeline />
          <Timeline />
          <Timeline />
          <Timeline />
          <Timeline />
          <Timeline />
          <Timeline />
        </div>
      </div>
    </div>
  );
};

export default Page;
