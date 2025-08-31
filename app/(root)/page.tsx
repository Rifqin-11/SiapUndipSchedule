"use client";

import React, { useState, useCallback, useMemo } from "react";
import CoursesCard from "@/components/homepage/CoursesCard";
import TodaySubject from "@/components/homepage/TodaySubject";
import CurrentDayDate from "@/components/homepage/CurrentDayDate";
import FloatingActionButton from "@/components/homepage/FloatingActionButton";
import SubjectModal from "@/components/subject-detail/SubjectModal";
import { useSubjects, Subject } from "@/hooks/useSubjects";
import { useUserProfile } from "@/hooks/useUserProfile";
import { BookOpen, Plus } from "lucide-react";
import HomeSkeleton from "@/components/homepage/HomeSkeleton";
import useAutoNotifications from "@/hooks/useAutoNotifications";
import Link from "next/link";
import Image from "next/image";
import NotifIcon from "@/components/homepage/NotifIcon";

/** ⬇️ Tambahan: tasks & TaskCard */
import { useTasks } from "@/hooks/useTasks";
import { TaskCard } from "@/components/tasks/TaskCard";
import { getDaysUntilDue } from "@/components/tasks/utils";
import type { Task } from "@/components/tasks/types";
import { DeleteConfirmDialog, TaskDetailDrawer, TaskFormDrawer } from "@/components/tasks";
import { toast } from "sonner";
import { useSubjectsForTasks } from "@/hooks/useSubjectsForTasks";

const Page = () => {
  const { subjects, loading, createSubject, refetch } = useSubjects();
  const { user } = useUserProfile();
  const { loading: subjectsLoading } = useSubjectsForTasks();

  const {
    tasks,
    loading: tasksLoading,
    createTask,
    updateTask,
    deleteTask,
  } = useTasks();

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
      const newStatus = task.status === "completed" ? "in-progress" : "completed";
      try {
        await updateTask(task._id || task.id, { status: newStatus });
        toast.success("Task status updated");
        // sinkronkan jika drawer sedang menampilkan task ini
        setSelectedTask((prev) =>
          prev?.id === task.id ? { ...prev, status: newStatus } : prev
        );
      } catch {
        toast.error("Failed to update status");
      }
    },
    [updateTask]
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
          await updateTask(editingTask._id || editingTask.id, data);
          toast.success("Task updated");
        } else {
          await createTask(data);
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
    [editingTask, updateTask, createTask]
  );

  // DELETE dari drawer (munculkan dialog konfirmasi)
  const requestDelete = useCallback((task: Task) => {
    setTaskToDelete(task);
    setConfirmOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!taskToDelete) return;
    try {
      await deleteTask(taskToDelete._id || taskToDelete.id);
      toast.success("Task deleted");
      setConfirmOpen(false);
      if (selectedTask?.id === taskToDelete.id) setDetailOpen(false);
    } catch {
      toast.error("Failed to delete task");
    } finally {
      setTaskToDelete(null);
    }
  }, [deleteTask, taskToDelete, selectedTask]);

  // Initialize auto notifications
  useAutoNotifications();

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddSubject = useCallback(() => {
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
        const result = await createSubject(subjectWithUserId);
        if (result.success) {
          refetch();
          return { success: true };
        } else {
          return { success: false, error: result.error };
        }
      } catch {
        return { success: false, error: "Terjadi kesalahan tak terduga" };
      }
    },
    [user?.id, createSubject, refetch]
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

    return subjects.slice(0, 6).map((subject) => (
      <div key={subject.id} className="flex-shrink-0 w-64">
        <CoursesCard name={subject.name} meeting={subject.meeting} />
      </div>
    ));
  }, [subjects, handleAddSubject]);

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

  // Loading state
  if (loading) {
    return <HomeSkeleton />;
  }

  return (
    <main className="animate-fadeIn">
      {/* Header Section with Profile and Notifications - Hide on desktop since it's in sidebar */}
      <section className="flex flex-row gap-2 items-center mt-4 mx-5 lg:hidden">
        <div className="flex flex-row justify-between items-center w-full">
          <div className="flex flex-row gap-2 items-center">
            {user?.profileImage ? (
              <Image
                src={user.profileImage}
                alt="Profile Picture"
                width={40}
                height={40}
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

      <section className="flex flex-col mt-6 mx-6 text-lg dark:text-white space-y-1">
        <h1 className="text-xl font-extrabold tracking-tight">
          Hi {firstName}, here&apos;s your schedule
        </h1>
        <CurrentDayDate />
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
        <div className="overflow-x-auto px-6 py-2 scrollbar-thin scrollbar-thumb-gray-900 dark:scrollbar-thumb-gray-900">
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
      />
    </main>
  );
};

export default Page;
