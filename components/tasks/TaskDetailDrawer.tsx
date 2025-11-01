"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Trash2,
  Link as LinkIcon,
  CalendarDays,
  Bell,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import type { Task } from "./types";

/** Simple media query hook */
function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mql.matches);
    // Safari fallback addListener/removeListener
    if (mql.addEventListener) {
      mql.addEventListener(
        "change",
        onChange as (e: MediaQueryListEvent) => void
      );
      return () =>
        mql.removeEventListener(
          "change",
          onChange as (e: MediaQueryListEvent) => void
        );
    } else {
      mql.addListener(onChange);
      return () => mql.removeListener(onChange);
    }
  }, [query]);
  return matches;
}

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  task: Task | null;
  onEdit: (t: Task) => void;
  onDelete: (t: Task) => void;
  onToggleStatus: () => void;
};

export const TaskDetailDrawer: React.FC<Props> = ({
  open,
  onOpenChange,
  task,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const [reminderOn, setReminderOn] = React.useState(true);
  const isXL = useMediaQuery("(min-width: 1280px)");
  const side: "right" | "bottom" = isXL ? "right" : "bottom";

  if (!task) return null;

  const wrapperClasses =
    "w-full bg-gray-50 dark:bg-neutral-900 overflow-hidden flex flex-col px-6 py-5";
  const variantClasses = isXL
    ? "sm:max-w-md md:max-w-lg h-dvh rounded-l-3xl border-l border-gray-200 dark:border-neutral-800"
    : "max-w-full h-[86vh] rounded-t-3xl border-t border-gray-200 dark:border-neutral-800";

  // ambil category (optional di tipe Task)
  const category = (task as { category?: string })?.category?.trim();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        className={`${wrapperClasses} ${variantClasses}`}
      >
        <SheetHeader className="space-y-2 shrink-0">
          <div className="flex items-center justify-end gap-2">
            <button
              className="w-9 h-9 rounded-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 grid place-items-center"
              onClick={() => onEdit(task)}
              aria-label="Edit task"
              title="Edit"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              className="w-9 h-9 rounded-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 grid place-items-center"
              onClick={() => onDelete(task)}
              aria-label="Delete task"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <SheetTitle className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-gray-900 dark:text-white">
            {task.title}
          </SheetTitle>

          <div className="flex flex-wrap items-center gap-2">
            {/* status */}
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                task.status === "completed"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                  : task.status === "in-progress"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              {task.status.replace("-", " ")}
            </span>

            {/* priority */}
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                task.priority === "high"
                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                  : task.priority === "medium"
                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              {task.priority}
            </span>

            {/* category badge (baru) */}
            {category && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                {category}
              </span>
            )}

            {/* due date */}
            {/* <span className="px-3 py-1 rounded-full text-sm font-medium bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300">
              {new Date(task.dueDate).toLocaleDateString(undefined, {
                weekday: "short",
                day: "2-digit",
                month: "short",
              })}
              {task.dueTime &&
                ` • ${task.dueTime.split(":").slice(0, 2).join(":")}`}
            </span> */}

            {/* subject (opsional) */}
            {task.subject?.name && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300">
                {task.subject.name}
              </span>
            )}
          </div>
        </SheetHeader>

        <div className="space-y-4 overflow-y-auto pr-1 flex-1">
          {/* Description - sekarang dalam scrollable area */}
          <div className="mt-3">
            <SheetDescription className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap break-words leading-relaxed">
              {task.description || "No description provided."}
            </SheetDescription>
          </div>
          {/* Link */}
          <div className="flex items-center justify-between rounded-3xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 px-4 py-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-neutral-700 grid place-items-center shrink-0">
                <LinkIcon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {task.submissionLink ? "Submission Link" : "No Link"}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {task.submissionLink || "—"}
                </div>
              </div>
            </div>
            {task.submissionLink && (
              <a
                href={task.submissionLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="secondary" className="rounded-full px-6">
                  Open
                </Button>
              </a>
            )}
          </div>

          {/* Due date */}
          <div className="flex items-center justify-between rounded-3xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-neutral-700 grid place-items-center">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  Due date
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <time dateTime={new Date(task.dueDate).toISOString()}>
                    {new Date(task.dueDate).toLocaleDateString(undefined, {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "2-digit",
                    })}
                  </time>
                  {task.dueTime && (
                    <> · {task.dueTime.split(":").slice(0, 2).join(":")}</>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Reminder */}
          <div className="flex items-center justify-between rounded-3xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-neutral-700 grid place-items-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  Reminder schedule
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Toggle reminders for this task
                </div>
              </div>
            </div>
            <Switch checked={reminderOn} onCheckedChange={setReminderOn} />
          </div>
        </div>

        <SheetFooter className="pt-4 mt-2 border-t border-gray-200 dark:border-neutral-800 shrink-0">
          <div className="flex w-full gap-3">
            <Button className="flex-1 rounded-full" onClick={onToggleStatus}>
              {task.status === "completed"
                ? "Mark as Pending"
                : "Mark as Completed"}
            </Button>
            <Button
              variant="outline"
              className="flex-1 rounded-full"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
