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
import { Textarea } from "../ui/textarea";

/** Simple media query hook: true kalau >= 1280px (xl) */
function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent | MediaQueryList) =>
      setMatches(
        (e as MediaQueryListEvent).matches ?? (e as MediaQueryList).matches
      );
    setMatches(mql.matches);
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

type FormValues = {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "completed";
  dueDate: string;
  dueTime: string;
  submissionLink: string;
  /** REQUIRED now */
  category: string;
  subjectId: string;
};

type CategoryOption = { value: string; label?: string };

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialTask?: Task | null;
  subjects?: Subject[];
  loadingSubjects?: boolean;
  submitting?: boolean;
  /** Optional: override daftar kategori */
  categoryOptions?: CategoryOption[];
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
      /** REQUIRED now */
      category: string;
    }
  ) => Promise<void> | void;
};

const DEFAULT_CATEGORIES: CategoryOption[] = [
  { value: "Homework" },
  { value: "Assignment" },
  { value: "Quiz" },
  { value: "Exam" },
  { value: "Project" },
  { value: "Lab" },
  { value: "Presentation" },
  { value: "Research" },
  { value: "Reading" },
];

export const TaskFormDrawer: React.FC<Props> = ({
  open,
  onOpenChange,
  initialTask,
  subjects = [],
  loadingSubjects = false,
  submitting = false,
  onSubmit,
  categoryOptions = DEFAULT_CATEGORIES,
}) => {
  const isXL = useMediaQuery("(min-width: 1280px)");
  const side: "right" | "bottom" = isXL ? "right" : "bottom";

  const [values, setValues] = React.useState<FormValues>({
    title: "",
    description: "",
    priority: "medium",
    status: "in-progress",
    dueDate: "",
    dueTime: "",
    submissionLink: "",
    category: "",
    subjectId: "",
  });

  const [errors, setErrors] = React.useState<{ category?: string }>({});

  React.useEffect(() => {
    if (!initialTask) {
      setValues({
        title: "",
        description: "",
        priority: "medium",
        status: "in-progress",
        dueDate: "",
        dueTime: "",
        submissionLink: "",
        category: "",
        subjectId: "",
      });
      setErrors({});
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
      category: (initialTask as { category?: string })?.category || "",
      submissionLink: initialTask.submissionLink || "",
      subjectId: initialTask.subjectId || "",
    });
    setErrors({});
  }, [initialTask]);

  const formRef = React.useRef<HTMLFormElement | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi: title, dueDate, category wajib
    const nextErrors: typeof errors = {};
    if (!values.category) nextErrors.category = "Category is required";
    setErrors(nextErrors);
    if (!values.title.trim() || !values.dueDate || nextErrors.category) return;

    const payload = {
      title: values.title.trim(),
      description: values.description.trim(),
      priority: values.priority,
      status: values.status,
      dueDate: values.dueTime
        ? `${values.dueDate}T${values.dueTime}:00`
        : values.dueDate,
      category: values.category, // REQUIRED
      dueTime: values.dueTime || undefined,
      submissionLink: values.submissionLink.trim() || undefined,
      subjectId: values.subjectId || undefined,
    };
    onSubmit?.(payload);
  };

  // Kelas dasar & varian agar match dengan TaskDetailDrawer
  const wrapperClasses =
    "w-full bg-gray-50 dark:bg-neutral-900 overflow-hidden flex flex-col px-6 py-5";
  const variantClasses = isXL
    ? "sm:max-w-md md:max-w-lg h-dvh rounded-l-3xl border-l border-gray-200 dark:border-neutral-800"
    : "max-w-full h-[86vh] rounded-t-3xl border-t border-gray-200 dark:border-neutral-800";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        className={`${wrapperClasses} ${variantClasses}`}
      >
        {/* Header */}
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

        {/* Body */}
        <form
          ref={formRef}
          onSubmit={submit}
          className="mt-4 space-y-6 overflow-y-auto pr-1 flex-1"
        >
          {/* Basic information */}
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
                <Textarea
                  id="description"
                  value={values.description}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, description: e.target.value }))
                  }
                />
              </div>

              {/* Category REQUIRED as Select */}
              <div className="space-y-2 w-full">
                <Label>Category *</Label>
                <Select
                  value={values.category}
                  onValueChange={(v) => {
                    setValues((s) => ({ ...s, category: v }));
                    if (errors.category)
                      setErrors((e) => ({ ...e, category: undefined }));
                  }}
                >
                  <SelectTrigger
                    className={
                      errors.category ? "border-red-500 focus:ring-red-500" : ""
                    }
                    aria-invalid={!!errors.category}
                    aria-errormessage={
                      errors.category ? "category-error" : undefined
                    }
                  >
                    <SelectValue placeholder="Choose category" />
                  </SelectTrigger>
                  <SelectContent className="z-[70]">
                    {categoryOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label ?? opt.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p id="category-error" className="text-xs text-red-600 mt-1">
                    {errors.category}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Details & schedule */}
          <section className="rounded-3xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 p-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Details & schedule
            </h4>

            <div className="grid grid-cols-2 gap-4">
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
                  <SelectContent className="z-[70]">
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
                  <SelectContent className="z-[70]">
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

          {/* Preview chips */}
          <section className="rounded-3xl bg-white/60 dark:bg-neutral-800/60 border border-dashed border-gray-200 dark:border-neutral-700 p-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Preview chips
            </h4>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="px-3 py-1 rounded-full font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {values.status.replace("-", " ")}
              </span>
              <span className="px-3 py-1 rounded-full font-medium bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300">
                {values.priority}
              </span>
              <span className="px-3 py-1 rounded-full font-medium bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300">
                {values.dueDate
                  ? new Date(values.dueDate).toLocaleDateString(undefined, {
                      weekday: "short",
                      day: "2-digit",
                      month: "short",
                    })
                  : "No date"}
                {values.dueTime &&
                  ` • ${values.dueTime.split(":").slice(0, 2).join(":")}`}
              </span>
              {values.category && (
                <span className="px-3 py-1 rounded-full font-medium bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300">
                  {values.category}
                </span>
              )}
              {values.subjectId && (
                <span className="px-3 py-1 rounded-full font-medium bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300">
                  Subject selected
                </span>
              )}
            </div>
          </section>
        </form>

        {/* Footer */}
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
