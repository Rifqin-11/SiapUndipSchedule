import { Clock, Locate, PinIcon } from "lucide-react";
import React from "react";

const page = ({
  name,
  room,
  startTime,
  endTime,
  lecturer,
  category,
  bgColor,
  textColor,
  bgRoomColor,
}: subject & { bgColor: string; textColor: string; bgRoomColor: string }) => {
  return (
    <div className="flex flex-col mx-5 mt-6 gap-4">
      <div className="bg-red-100 rounded w-15 text-center">High</div>
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="font-bold text-xl">Keamanan Jaringan</h1>
          <p className="text-justify mt-2">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Sint
            exercitationem soluta, commodi fugiat autem officia natus laborum
            doloremque iusto excepturi dolores dolorem, cum aspernatur, iure
            laudantium obcaecati earum officiis voluptates?
          </p>
        </div>

        <div>
          <h1 className="font-bold">Lecturer</h1>
          <div className="flex flex-row gap-2">
            <p>Ir. M. Arfan S.T M.T,</p>
            <p>Yoshua Alfin S.T M.T</p>
          </div>
        </div>

        <div>
          <h1 className="font-bold">Date:</h1>
          <div className="flex flex-row justify-around mt-2">
            <div className="flex flex-row gap-2 items-center justify-center">
              <Clock className="" />
              <div className="flex flex-col">
                <p className="text-xs">Dates:</p>
                <h1 className="font-bold">23 May 2025</h1>
              </div>
            </div>
            <div className="flex flex-row gap-2 items-center justify-center">
              <PinIcon />
              <div className="flex flex-col">
                <p className="text-xs">Room:</p>
                <h1 className="font-bold">B.203</h1>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
