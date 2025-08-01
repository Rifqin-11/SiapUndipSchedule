import React from "react";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import { Edit2, Trash2, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CalendarCardProps {
  _id?: string;
  id: string;
  name: string;
  day: string;
  room: string;
  startTime: string;
  endTime: string;
  lecturer: string[];
  meeting: number;
  category?: string;
  bgColor: string;
  textColor: string;
  bgRoomColor: string;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

const CalendarCard = ({
  name,
  room,
  startTime,
  endTime,
  lecturer,
  bgColor,
  textColor,
  meeting,
  onEdit,
  onDelete,
  showActions = false,
}: CalendarCardProps) => {
  const proggressMeeting = (meeting / 14) * 100;

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit?.();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete?.();
  };

  return (
    <div className="flex flex-row gap-4 mt-2">
      <div className="flex flex-row w-full p-2 gap-1">
        <div className="flex flex-col justify-between text-xs">
          <h1>{startTime}</h1>
          <h1>{endTime}</h1>
        </div>
        <div
          className={`flex flex-col justify-around ${bgColor} w-full rounded-xl px-4 py-2 relative`}
        >
          {showActions && (
            <div className="absolute top-2 right-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 w-8 p-0 ${textColor} hover:bg-white/20`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          <div className="flex flex-row gap-2 justify-between items-center">
            <h1
              className={`font-bold ${textColor} ${showActions ? "pr-8" : ""}`}
            >
              {name}
            </h1>
            <div
              className={`bg-white/60 rounded-lg p-1 px-2 text-xs ${textColor}`}
            >
              {room}
            </div>
          </div>
          <div className="mt-3">
            {lecturer.map((lecturer, index) => (
              <p
                key={index}
                className={`text-xs ${textColor} truncate overflow-hidden whitespace-nowrap max-w-[240px]`}
              >
                {lecturer}
              </p>
            ))}
          </div>
          <div className="flex flex-col mt-3 gap-1">
            <div className="flex flex-row justify-between items-center">
              <h1 className="text-xs text-gray-500">Progress</h1>
              <p className="text-xs text-gray-500">{meeting}/14</p>
            </div>
            <Progress value={proggressMeeting} className="bg-blue-200" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarCard;
