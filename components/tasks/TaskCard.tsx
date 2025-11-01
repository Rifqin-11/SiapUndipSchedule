"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  CheckCircle,
  CircleArrowOutUpRight,
  Clock,
} from "lucide-react";
import type { Task, Subject } from "./types";

/** Tema vibrant ala mockup */
const vibrantThemes = [
  {
    bg: "bg-[#694cf1]",
    text: "text-white",
    muted: "text-white/80",
    icon: "bg-black/20 text-white",
    chip: "bg-white/20 text-white",
    pill: "bg-transparent text-white",
    action: "bg-white/20 hover:bg-white/30 text-white",
    border: "border-white/40",
  },
  {
    bg: "bg-[#fdc743]",
    text: "text-gray-900",
    muted: "text-gray-800/80",
    icon: "bg-black/20 text-white",
    chip: "bg-black/10 text-gray-900",
    pill: "bg-transparent text-gray-900",
    action: "bg-black/10 hover:bg-black/15 text-gray-900",
    border: "border-black/40",
  },
  {
    bg: "bg-[#cbd87d]",
    text: "text-gray-900",
    muted: "text-gray-800/80",
    icon: "bg-black/20 text-white",
    chip: "bg-black/10 text-gray-900",
    pill: "bg-transparent text-gray-900",
    action: "bg-black/10 hover:bg-black/15 text-gray-900",
    border: "border-black/40",
  },
  {
    bg: "bg-[#1e1e1e]",
    text: "text-white",
    muted: "text-white/70",
    icon: "bg-white/10 text-white",
    chip: "bg-white/10 text-white",
    pill: "bg-transparent text-white",
    action: "bg-white/10 hover:bg-white/20 text-white",
    border: "border-white/30",
  },
] as const;

const pickVibrantTheme = (key: string) => {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return vibrantThemes[h % vibrantThemes.length];
};

export type TaskCardProps = {
  task: Task;
  subjects?: Subject[];
  getDaysUntilDue: (dueDate: string) => number;
  onOpenDetail: () => void;
  onToggleDone: () => void;
  className?: string;
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  subjects, // masih diterima untuk kompatibilitas, tapi tidak dipakai di header
  getDaysUntilDue,
  onOpenDetail,
  onToggleDone,
  className = "",
}) => {
  const theme = pickVibrantTheme((task._id as string) ?? task.id ?? task.title);

  const getDueDateTime = () => {
    const base = new Date(task.dueDate);
    if (task.dueTime) {
      const [hh, mm] = task.dueTime.split(":").map((n) => parseInt(n, 10) || 0);
      base.setHours(hh ?? 0, mm ?? 0, 0, 0);
    }
    return base;
  };

  const now = new Date();
  const dueAt = getDueDateTime();
  const diffMs = dueAt.getTime() - now.getTime();

  const isOverdueByTime = diffMs < 0;

  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const isLessThanOneDay = diffMs >= 0 && diffMs < ONE_DAY_MS;

  const hoursLeft = isLessThanOneDay
    ? Math.ceil(diffMs / (60 * 60 * 1000))
    : null;

  const daysUntilDue = getDaysUntilDue(task.dueDate);
  const isOverdue = isOverdueByTime;
  const isDueSoon = !isOverdue && daysUntilDue <= 3 && daysUntilDue >= 0;

  const getSubjectName = () => {
    if (task.subject?.name) return task.subject.name;
    if (task.subjectId && subjects?.length) {
      const found = subjects.find((s) => s.id === task.subjectId);
      return found?.name;
    }
    return undefined;
  };

  // pakai category saja di header
  const category = (task as { category?: string })?.category?.trim();

  const getStatusVisual = (status: Task["status"]) => {
    switch (status) {
      case "in-progress":
        return {
          Icon: Clock,
          wrapperExtra: "ring-2 ring-blue-400/70 animate-pulse",
          aria: "In progress",
        };
      case "completed":
        return {
          Icon: CheckCircle,
          wrapperExtra: "ring-2 ring-emerald-400/70",
          aria: "Completed",
        };
      default: // "pending"
        return {
          Icon: CalendarDays,
          wrapperExtra: "ring-2 ring-white/20",
          aria: "Pending",
        };
    }
  };

  const { Icon, aria } = getStatusVisual(task.status);
  const isDone = task.status === "completed";

  return (
    <article
      className={`
        relative
        ${theme.bg} ${theme.text}
        rounded-2xl sm:rounded-[24px] md:rounded-[28px]
        p-4 sm:p-5 md:p-6
        border border-transparent
        shadow-[0_4px_14px_rgba(0,0,0,.08)]
        hover:shadow-[0_8px_24px_rgba(0,0,0,.12)]
        transition-shadow duration-200
        ${isDone ? "ring-1 ring-emerald-300/60" : ""}
        ${className}
      `}
      aria-labelledby={`task-title-${task.id}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={`${theme.icon} p-2 rounded-full`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
          <span className="sr-only">{aria}</span>
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-sm sm:text-[15px] font-semibold leading-tight truncate">
            {(getSubjectName() ?? category) && (
              <span>{getSubjectName() ?? category}</span>
            )}
          </h3>
          <div
            className={`mt-0.5 sm:mt-1 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm ${theme.muted}`}
          >
            <span className="tabular-nums">
              {task.dueTime
                ? task.dueTime.split(":").slice(0, 2).join(":")
                : "No time"}
            </span>
            {isOverdue && <span className="font-medium">(Overdue)</span>}

            {!isOverdue && isLessThanOneDay && (
              <span className="font-medium">
                ({hoursLeft} hour{hoursLeft !== 1 ? "s" : ""} left)
              </span>
            )}

            {!isOverdue && !isLessThanOneDay && isDueSoon && (
              <span className="font-medium">
                ({daysUntilDue} day{daysUntilDue !== 1 ? "s" : ""} left)
              </span>
            )}
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className={`rounded-full bg-white text-gray-800`}
          aria-label="Open task detail"
          title="Open task detail"
          onClick={onOpenDetail}
        >
          <CircleArrowOutUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      </div>

      {/* Title */}
      <h2
        id={`task-title-${task.id}`}
        className="mt-3 sm:mt-4 text-lg sm:text-xl font-semibold leading-snug line-clamp-2"
      >
        {task.title}
      </h2>

      {/* Footer */}
      <div className="mt-4 sm:mt-5 flex flex-wrap gap-1.5 sm:gap-2">
        <Button
          type="button"
          variant="secondary"
          className={`
            px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-xs sm:text-sm
            ${
              isDone
                ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                : theme.chip
            }
            border-0
          `}
          onClick={onToggleDone}
          aria-pressed={isDone}
          title={isDone ? "Mark as pending" : "Mark as completed"}
        >
          {isDone ? (
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              Done
            </span>
          ) : (
            "Mark Done"
          )}
        </Button>

        <div
          className={`flex items-center px-3 py-1 sm:px-4 sm:py-1.5 rounded-lg sm:rounded-xl border ${theme.border} ${theme.pill} text-xs sm:text-sm`}
        >
          <time className="tabular-nums leading-none">
            {new Date(task.dueDate).toLocaleDateString(undefined, {
              weekday: "short",
              day: "2-digit",
              month: "short",
            })}
          </time>
        </div>
      </div>
    </article>
  );
};
