"use client";

import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  Suspense,
} from "react";
import dynamic from "next/dynamic";

// Critical components - load immediately
import CurrentDayDate from "@/components/homepage/CurrentDayDate";
import FastLoadingSkeleton from "@/components/homepage/FastLoadingSkeleton";

// Semi-critical components - lazy but prioritized
const TodaySubject = dynamic(
  () => import("@/components/homepage/TodaySubject"),
  {
    ssr: false,
    loading: () => (
      <div className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>
    ),
  }
);

const CoursesCard = dynamic(() => import("@/components/homepage/CoursesCard"), {
  ssr: false,
  loading: () => (
    <div className="flex-shrink-0 w-64 h-24 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>
  ),
});

// Non-critical components - defer loading
const FloatingActionButton = dynamic(
  () => import("@/components/homepage/FloatingActionButton"),
  { ssr: false, loading: () => <div /> }
);

const SubjectModal = dynamic(() => import("@/components/SubjectModal"), {
  ssr: false,
  loading: () => <div />,
});

const NotifIcon = dynamic(() => import("@/components/homepage/NotifIcon"), {
  ssr: false,
  loading: () => <div />,
});

// Task components - defer completely
const TaskFormDrawer = dynamic(
  () => import("@/components/tasks").then((m) => m.TaskFormDrawer),
  { ssr: false, loading: () => <div /> }
);

const DeleteConfirmDialog = dynamic(
  () => import("@/components/tasks").then((m) => m.DeleteConfirmDialog),
  { ssr: false, loading: () => <div /> }
);

const TaskDetailDrawer = dynamic(
  () => import("@/components/tasks").then((m) => m.TaskDetailDrawer),
  { ssr: false, loading: () => <div /> }
);

// Imports for hooks and utilities
import { useSubjects, useCreateSubject, Subject } from "@/hooks/useSubjects";
import { useAutoSyncSubject } from "@/hooks/useAutoSyncSubject";
import { useUserProfile } from "@/hooks/useUserProfile";
import { BookOpen, Plus } from "lucide-react";
import HomeSkeleton from "@/components/homepage/HomeSkeleton";
import useAutoNotifications from "@/hooks/useAutoNotifications";
import { formatLocalDate } from "@/utils/date";
import Link from "next/link";
import Image from "next/image";
import { useScrollOpacity } from "@/hooks/useScrollOpacity";
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
} from "@/hooks/useTasks";
import { useAutoSyncTask } from "@/hooks/useAutoSyncTask";
import { TaskCard } from "@/components/tasks/TaskCard";
import { getDaysUntilDue } from "@/components/tasks/utils";
import type { Task } from "@/components/tasks/types";
import { toast } from "sonner";
import { useSubjectsForTasks } from "@/hooks/useSubjectsForTasks";

const Page = () => {
  // State for instant loading UI
  const [showInstantLoading, setShowInstantLoading] = useState(true);

  // Critical data loading - load in parallel
  const {
    data: subjects = [],
    isLoading: loading,
    error,
    refetch,
  } = useSubjects();

  const { user } = useUserProfile();

  // Auto-sync integration
  const { syncSubjectToCalendar } = useAutoSyncSubject();
  const createSubjectMutation = useCreateSubject({
    onAutoSyncSuccess: (subject) => {
      syncSubjectToCalendar(subject);
    },
  });

  // Non-critical data loading - defer and lazy load
  const [enableNonCriticalLoading, setEnableNonCriticalLoading] =
    useState(false);

  // Only load tasks and other data after critical data is ready
  const { loading: subjectsLoading } = useSubjectsForTasks();
  const { data: tasks = [], isLoading: tasksLoading } = useTasks({
    enabled: enableNonCriticalLoading, // Only fetch when enabled
  });

  // Progressive loading strategy
  useEffect(() => {
    // Phase 1: Show instant loading for very short time
    const timer1 = setTimeout(() => {
      setShowInstantLoading(false);
    }, 100); // Reduced to 100ms for minimal skeleton flash

    // Phase 2: Enable non-critical data loading quickly
    const timer2 = setTimeout(() => {
      setEnableNonCriticalLoading(true);
    }, 250); // Load non-critical data after 250ms

    // Early exit if critical data is already ready
    if (!loading && user) {
      setShowInstantLoading(false);
      setEnableNonCriticalLoading(true);
      clearTimeout(timer1);
      clearTimeout(timer2);
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [loading, user]);

  // Hook untuk scroll opacity effect pada mobile header
  const scrollOpacity = useScrollOpacity({
    fadeDistance: 25,
    startOffset: 10,
  });

  // Auto-sync integration for tasks
  const { syncTaskToCalendar } = useAutoSyncTask();

  const createTaskMutation = useCreateTask({
    onAutoSyncSuccess: (task) => {
      syncTaskToCalendar(task);
    },
  });
  const updateTaskMutation = useUpdateTask({
    onAutoSyncSuccess: (task) => {
      syncTaskToCalendar(task);
    },
  });
  const deleteTaskMutation = useDeleteTask();

  // Drawer detail task
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Form task (edit)
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete confirm
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // BUKA drawer detail saat TaskCard di-klik
  const openDetail = useCallback((task: Task) => {
    setSelectedTask(task);
    setDetailOpen(true);
  }, []);

  // BUKA form edit dari drawer
  const openEdit = useCallback((task: Task) => {
    setEditingTask(task);
    setFormOpen(true);
  }, []);

  // TOGGLE status: hanya "in-progress" ⇄ "done"
  const toggleStatus = useCallback(
    async (task: Task) => {
      const newStatus =
        task.status === "completed" ? "in-progress" : "completed";
      try {
        await updateTaskMutation.mutateAsync({
          id: task._id || task.id,
          taskData: { status: newStatus },
        });
        toast.success("Task status updated");
        // sinkronkan jika drawer sedang menampilkan task ini
        setSelectedTask((prev) =>
          prev?.id === task.id ? { ...prev, status: newStatus } : prev
        );
      } catch {
        toast.error("Failed to update status");
      }
    },
    [updateTaskMutation]
  );

  // SUBMIT form create/edit task dari drawer
  const submitForm = useCallback(
    async (
      data: Parameters<
        NonNullable<React.ComponentProps<typeof TaskFormDrawer>["onSubmit"]>
      >[0]
    ) => {
      setSubmitting(true);
      try {
        if (editingTask) {
          await updateTaskMutation.mutateAsync({
            id: editingTask._id || editingTask.id,
            taskData: data,
          });
          toast.success("Task updated");
        } else {
          await createTaskMutation.mutateAsync(data);
          toast.success("Task created");
        }
        setFormOpen(false);
      } catch {
        toast.error(
          editingTask ? "Failed to update task" : "Failed to create task"
        );
      } finally {
        setSubmitting(false);
      }
    },
    [editingTask, updateTaskMutation, createTaskMutation]
  );

  // DELETE dari drawer (munculkan dialog konfirmasi)
  const requestDelete = useCallback((task: Task) => {
    setTaskToDelete(task);
    setConfirmOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!taskToDelete) return;
    try {
      await deleteTaskMutation.mutateAsync(taskToDelete._id || taskToDelete.id);
      toast.success("Task deleted");
      setConfirmOpen(false);
      if (selectedTask?.id === taskToDelete.id) setDetailOpen(false);
    } catch {
      toast.error("Failed to delete task");
    } finally {
      setTaskToDelete(null);
    }
  }, [deleteTaskMutation, taskToDelete, selectedTask]);

  // Initialize auto notifications with defer for better performance
  useAutoNotifications({ defer: true });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const handleAddSubject = useCallback(() => {
    // Set today's date as the selectedDate when adding from homepage
    const today = new Date();
    const todayString = formatLocalDate(today); // YYYY-MM-DD format
    setSelectedDate(todayString);
    setIsModalOpen(true);
  }, []);

  const handleSaveSubject = useCallback(
    async (subjectData: Omit<Subject, "_id">) => {
      try {
        if (!user?.id) {
          return { success: false, error: "User not authenticated" };
        }

        const subjectWithUserId = {
          ...subjectData,
          userId: user.id,
        };
        await createSubjectMutation.mutateAsync(subjectWithUserId);
        return { success: true };
      } catch (error) {
        return { success: false, error: "Terjadi kesalahan tak terduga" };
      }
    },
    [user?.id, createSubjectMutation]
  );

  // Memoize computed values
  const firstName = useMemo(() => {
    const userName = user?.name || "User";
    return userName.split(" ")[0];
  }, [user?.name]);

  const userName = useMemo(() => {
    return user?.name || "User";
  }, [user?.name]);

  // Courses carousel content
  const coursesContent = useMemo(() => {
    // Show loading state while subjects are being fetched
    if (loading) {
      return [...Array(3)].map((_, i) => (
        <div key={i} className="flex-shrink-0 w-64">
          <div className="bg-white dark:bg-card rounded-xl p-4 border border-gray-200 dark:border-border">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-full"></div>
            </div>
          </div>
        </div>
      ));
    }

    if (subjects.length === 0) {
      return (
        <div className="w-full max-w-xs mx-auto">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-2 border border-blue-200 dark:border-blue-800 shadow-sm">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-800/50 rounded-full flex items-center justify-center mb-3">
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-base font-semibold text-blue-900 dark:text-blue-200 mb-1">
                No Courses Yet
              </h3>
              <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                Add your first course to get started
              </p>
              <button
                onClick={handleAddSubject}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors duration-200 shadow-sm"
              >
                <Plus className="w-3 h-3 inline mr-1" />
                Add Course
              </button>
            </div>
          </div>
        </div>
      );
    }

    return subjects.map((subject) => (
      <div key={subject.id} className="flex-shrink-0 w-64">
        <CoursesCard
          name={subject.name}
          meeting={subject.meeting}
          specificDate={subject.specificDate}
          meetingDates={subject.meetingDates}
          attendanceDates={subject.attendanceDates}
        />
      </div>
    ));
  }, [subjects, loading, handleAddSubject]);

  // ⬇️ Helper: cek “hari ini” (tanpa mempedulikan jam/zonanya)
  const isSameDate = (isoDate: string, ref: Date) => {
    const d = new Date(isoDate);
    return (
      d.getFullYear() === ref.getFullYear() &&
      d.getMonth() === ref.getMonth() &&
      d.getDate() === ref.getDate()
    );
  };

  // ⬇️ Gabungkan dueDate + dueTime → Date untuk sorting per jam
  const dueTimestamp = (t: Task) => {
    const base = new Date(t.dueDate);
    if (t.dueTime) {
      const [hh, mm] = t.dueTime.split(":").map((n) => parseInt(n, 10) || 0);
      base.setHours(hh ?? 0, mm ?? 0, 0, 0);
    } else {
      // jika tidak ada dueTime, taruh di akhir hari agar tidak mendahului yang ada jam
      base.setHours(23, 59, 59, 999);
    }
    return base.getTime();
  };

  // ⬇️ Ambil task “in-progress” yang due hari ini, lalu urutkan
  const todaysInProgressTasks = useMemo(() => {
    const today = new Date();
    return tasks
      .filter(
        (t) =>
          t.status === "in-progress" &&
          t.dueDate &&
          isSameDate(t.dueDate, today)
      )
      .sort((a, b) => dueTimestamp(a) - dueTimestamp(b));
  }, [tasks]);

  // Loading state - Show minimal skeleton only if really needed
  if (showInstantLoading && !user) {
    return <FastLoadingSkeleton />;
  }

  // If we have user but still loading critical data, show a lighter loading state
  if (loading && user) {
    return (
      <main className="animate-fadeIn">
        {/* Header Section - Show immediately with real data */}
        <section className="flex flex-col mt-6 mx-6 text-lg dark:text-white space-y-1">
          <h1 className="text-xl font-extrabold tracking-tight">
            Hi {user?.name?.split(" ")[0] || "there"}, here&apos;s your schedule
          </h1>
          <CurrentDayDate />
        </section>

        {/* Minimal loading indication */}
        <section className="mt-6 mx-6">
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </section>
      </main>
    );
  }

  return (
    <main className="animate-fadeIn">
      {/* Header Section with Profile and Notifications - Hide on desktop since it's in sidebar */}
      <section
        className="fixed top-0 left-0 right-0 z-50 flex flex-row gap-2 items-center pt-4 px-5 lg:hidden"
        style={{
          opacity: scrollOpacity,
          pointerEvents: scrollOpacity < 0.3 ? "none" : "auto",
        }}
      >
        <div className="flex flex-row justify-between items-center w-full">
          <div className="flex flex-row gap-2 items-center">
            {user?.profileImage ? (
              <Image
                src={user.profileImage}
                alt="Profile Picture"
                width={40}
                height={40}
                priority={true}
                className="rounded-full size-10 object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
            )}
            <div>
              <h1 className="font-bold">{userName}</h1>
              <p className="text-xs text-gray-800 dark:text-gray-300">
                Welcome Back!
              </p>
            </div>
          </div>
          <div>
            <NotifIcon />
          </div>
        </div>
      </section>

      {/* Content wrapper dengan padding-top untuk fixed header di mobile */}
      <div className="pt-15 lg:pt-0">
        <section className="flex flex-row justify-between items-center mt-6 mx-6">
          <div className="flex flex-col text-lg dark:text-white space-y-1">
            <h1 className="text-xl font-extrabold tracking-tight">
              Hi {firstName}, here&apos;s your schedule
            </h1>
            <CurrentDayDate />
          </div>
          <div className="size-10 hidden xl:block">
            <NotifIcon />
          </div>
        </section>

        <section className="mt-6 dark:text-white">
          <div className="flex flex-row justify-between items-center mx-6 mb-2">
            <h2 className="font-bold text-xl">Your Courses</h2>
            <Link
              href="/settings/manage-subjects"
              className="text-xs text-blue-600 hover:underline dark:text-blue-400"
            >
              View more
            </Link>
          </div>

          {/* This div maintains overflow-x auto for horizontal scrolling */}
          <div className="overflow-x-scroll px-6 py-2 scrollbar-hide">
            <div className="flex gap-4">{coursesContent}</div>
          </div>
        </section>

        <section className="mt-6 mx-6 dark:text-white">
          <div className="flex flex-row justify-between items-center mb-2">
            <h2 className="font-bold text-xl">Today&apos;s Schedule</h2>
          </div>

          <TodaySubject />
        </section>

        {todaysInProgressTasks.length > 0 && (
          <section className="mt-4 mx-6 dark:text-white">
            <div className="flex flex-row justify-between items-center mb-2">
              <h2 className="font-bold text-xl">Today&apos;s Tasks</h2>
              <Link
                href="/tasks"
                className="text-xs text-blue-600 hover:underline dark:text-blue-400"
              >
                View all
              </Link>
            </div>

            {tasksLoading ? (
              <div className="bg-white dark:bg-card rounded-xl p-6 border border-gray-200 dark:border-border text-sm text-gray-600 dark:text-gray-400">
                Loading tasks…
              </div>
            ) : (
              <div className="space-y-3">
                {todaysInProgressTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    subjects={subjects}
                    onOpenDetail={() => openDetail(task)} // ⬅️ buka drawer
                    onToggleDone={() => toggleStatus(task)} // ⬅️ toggle in-progress/done
                    getDaysUntilDue={getDaysUntilDue}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* form drawer (create/edit) */}
        <TaskFormDrawer
          open={formOpen}
          onOpenChange={setFormOpen}
          loadingSubjects={subjectsLoading}
          subjects={subjects}
          initialTask={editingTask}
          submitting={submitting}
          onSubmit={submitForm}
        />

        {/* delete dialog */}
        <DeleteConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          task={taskToDelete}
          onConfirm={confirmDelete}
        />

        {/* detail drawer */}
        <TaskDetailDrawer
          open={detailOpen}
          onOpenChange={setDetailOpen}
          task={selectedTask}
          onEdit={openEdit}
          onDelete={requestDelete}
          onToggleStatus={() => selectedTask && toggleStatus(selectedTask)}
        />

        {/* Floating Action Button */}
        <FloatingActionButton onClick={handleAddSubject} />

        {/* Subject Modal */}
        <SubjectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveSubject}
          mode="add"
          selectedDate={selectedDate}
        />
      </div>
    </main>
  );
};

export default Page;
