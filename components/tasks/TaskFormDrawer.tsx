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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { SubjectCombobox } from "@/components/ui/subject-combobox";
import type { Task, Subject } from "./types";

type FormValues = {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "completed";
  dueDate: string;
  dueTime: string;
  submissionLink: string;
  subjectId: string;
};

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialTask?: Task | null;
  subjects?: Subject[];
  loadingSubjects?: boolean;
  submitting?: boolean;
  onSubmit: (
    data: Omit<
      Task,
      "id" | "_id" | "createdAt" | "updatedAt" | "subject" | "subjectId"
    > & {
      priority: "low" | "medium" | "high";
      status: "pending" | "in-progress" | "completed";
      dueDate: string;
      dueTime?: string;
      submissionLink?: string;
      subjectId?: string;
    }
  ) => Promise<void> | void;
};

export const TaskFormDrawer: React.FC<Props> = ({
  open,
  onOpenChange,
  initialTask,
  subjects = [],
  loadingSubjects = false,
  submitting = false,
  onSubmit,
}) => {
  const [values, setValues] = React.useState<FormValues>({
    title: "",
    description: "",
    priority: "medium",
    status: "pending",
    dueDate: "",
    dueTime: "",
    submissionLink: "",
    subjectId: "",
  });

  React.useEffect(() => {
    if (!initialTask) {
      setValues({
        title: "",
        description: "",
        priority: "medium",
        status: "pending",
        dueDate: "",
        dueTime: "",
        submissionLink: "",
        subjectId: "",
      });
      return;
    }
    const [date, time] = initialTask.dueDate.includes("T")
      ? initialTask.dueDate.split("T")
      : [initialTask.dueDate, initialTask.dueTime || ""];
    setValues({
      title: initialTask.title,
      description: initialTask.description || "",
      priority: initialTask.priority,
      status: initialTask.status,
      dueDate: date,
      dueTime: time.replace("Z", "").substring(0, 5) || "",
      submissionLink: initialTask.submissionLink || "",
      subjectId: initialTask.subjectId || "",
    });
  }, [initialTask]);

  const formRef = React.useRef<HTMLFormElement | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.title.trim() || !values.dueDate) return;

    const payload = {
      title: values.title.trim(),
      description: values.description.trim(),
      priority: values.priority,
      status: values.status,
      dueDate: values.dueTime
        ? `${values.dueDate}T${values.dueTime}:00`
        : values.dueDate,
      dueTime: values.dueTime || undefined,
      submissionLink: values.submissionLink.trim() || undefined,
      subjectId: values.subjectId || undefined,
    };
    onSubmit?.(payload);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md md:max-w-lg h-dvh px-6 py-5 rounded-l-3xl bg-gray-50 dark:bg-neutral-900 border-l border-gray-200 dark:border-neutral-800 overflow-hidden flex flex-col"
      >
        <SheetHeader className="shrink-0">
          <SheetTitle className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {initialTask ? "Edit Task" : "Add New Task"}
          </SheetTitle>
          <SheetDescription className="text-gray-600 dark:text-gray-400">
            {initialTask
              ? "Update the task details below."
              : "Create a new task to track your progress."}
          </SheetDescription>
        </SheetHeader>

        <form
          ref={formRef}
          onSubmit={submit}
          className="mt-4 space-y-6 overflow-y-auto pr-1 flex-1"
        >
          {/* basic */}
          <section className="rounded-3xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 p-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Basic information
            </h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={values.title}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, title: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={values.description}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, description: e.target.value }))
                  }
                />
              </div>
            </div>
          </section>

          {/* meta */}
          <section className="rounded-3xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 p-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Details & schedule
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={values.priority}
                  onValueChange={(v) =>
                    setValues((s) => ({
                      ...s,
                      priority: v as "low" | "medium" | "high",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={values.status}
                  onValueChange={(v) =>
                    setValues((s) => ({
                      ...s,
                      status: v as "pending" | "in-progress" | "completed",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Due Date *</Label>
                <Input
                  type="date"
                  value={values.dueDate}
                  onChange={(e) =>
                    setValues((s) => ({ ...s, dueDate: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Due Time (Optional)</Label>
                <Input
                  type="time"
                  value={values.dueTime}
                  onChange={(e) =>
                    setValues((s) => ({ ...s, dueTime: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Label>Submission Link (Optional)</Label>
              <Input
                type="url"
                value={values.submissionLink}
                onChange={(e) =>
                  setValues((s) => ({ ...s, submissionLink: e.target.value }))
                }
              />
            </div>

            <div className="mt-4 space-y-2">
              <Label>Related Subject (Optional)</Label>
              {loadingSubjects ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading subjects…
                </div>
              ) : (
                <SubjectCombobox
                  subjects={subjects}
                  value={values.subjectId}
                  onValueChange={(v) =>
                    setValues((s) => ({ ...s, subjectId: v }))
                  }
                  placeholder="Select a subject (optional)"
                  className="w-full max-w-full"
                />
              )}
            </div>
          </section>
        </form>

        <SheetFooter className="pt-4 mt-2 border-t border-gray-200 dark:border-neutral-800 shrink-0">
          <div className="flex w-full gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-full"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1 rounded-full"
              onClick={() => formRef.current?.requestSubmit()}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {initialTask ? "Updating..." : "Creating..."}
                </>
              ) : initialTask ? (
                "Update Task"
              ) : (
                "Create Task"
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
