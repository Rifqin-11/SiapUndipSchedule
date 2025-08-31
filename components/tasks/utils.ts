import type { Subject, Task } from "./types";

/** Hari tersisa tanpa bias jam */
export const getDaysUntilDue = (dueDate: string) => {
  const today = new Date();
  const due = new Date(dueDate);
  const d0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const d1 = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  return Math.round((d1.getTime() - d0.getTime()) / (1000 * 60 * 60 * 24));
};

export const subjectNameOf = (task: Task, subjects?: Subject[]) => {
  if (task.subject?.name) return task.subject.name;
  if (task.subjectId && subjects?.length) {
    return subjects.find((s) => s.id === task.subjectId)?.name;
  }
  return undefined;
};

