"use client";

import React, { useMemo, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import {
  BookOpen,
  CheckCircle,
  Clock,
  Plus,
  Search,
  Filter,
  Flag,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const GoogleCalendarTasksIntegration = dynamic(
  () => import("@/components/tasks/GoogleCalendarTasksIntegration"),
  { ssr: false, loading: () => <div /> }
);
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  type Task,
} from "@/hooks/useTasks";
import { useSubjectsForTasks } from "@/hooks/useSubjectsForTasks";

import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskDetailDrawer } from "@/components/tasks/TaskDetailDrawer";
import { TaskFormDrawer } from "@/components/tasks/TaskFormDrawer";
import { DeleteConfirmDialog } from "@/components/tasks/DeleteConfirmDialog";

import { getDaysUntilDue } from "@/components/tasks/utils";
import PageHeader from "@/components/PageHeader";

export default function TasksPage() {
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();

  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  const { subjects, loading: subjectsLoading } = useSubjectsForTasks();

  // filter/search
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("in-progress");
  const [filterPriority, setFilterPriority] = useState<string>("all");

  // detail
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // form
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // delete
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const stats = useMemo(() => {
    const inProgress = tasks.filter((t) => t.status === "in-progress").length;
    const complete = tasks.filter((t) => t.status === "completed").length;
    const total = inProgress + complete;
    return { total, inProgress, complete };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const q = searchTerm.toLowerCase();
    const prioRank: Record<string, number> = { high: 0, medium: 1, low: 2 };
    const getDueTime = (t: Task) => {
      return t.dueDate
        ? new Date(t.dueDate).getTime()
        : Number.POSITIVE_INFINITY;
    };
    return tasks
      .filter((t) => {
        const matchesSearch =
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q);
        const matchesStatus =
          filterStatus === "all" || t.status === filterStatus;
        const matchesPriority =
          filterPriority === "all" || t.priority === filterPriority;
        return matchesSearch && matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        const at = getDueTime(a);
        const bt = getDueTime(b);
        if (at !== bt) return at - bt;
        const ap = prioRank[a.priority ?? ""] ?? 99;
        const bp = prioRank[b.priority ?? ""] ?? 99;
        if (ap !== bp) return ap - bp;
        return a.title.localeCompare(b.title);
      });
  }, [tasks, searchTerm, filterStatus, filterPriority]);

  const openCreate = () => {
    setEditingTask(null);
    setFormOpen(true);
  };

  const openEdit = useCallback((task: Task) => {
    setEditingTask(task);
    setFormOpen(true);
  }, []);

  const openDetail = useCallback((task: Task) => {
    setSelectedTask(task);
    setDetailOpen(true);
  }, []);

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
        setSelectedTask((prev) =>
          prev?.id === task.id ? { ...prev, status: newStatus } : prev
        );
      } catch {
        toast.error("Failed to update status");
      }
    },
    [updateTaskMutation]
  );

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <PageHeader
        variant="tasks"
        // selectedDay="Wednesday"   // opsional; kalau tidak diisi pakai hari ini
        rightSlot={
          <div className="flex gap-2">
            <GoogleCalendarTasksIntegration tasks={tasks} />
            <Button
              onClick={openCreate}
              className="bg-black dark:bg-secondary hover:bg-gray-700 rounded-full sm:rounded-md text-white"
            >
              <Plus className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Add Task</span>
            </Button>
          </div>
        }
      />
      {/* Content dengan padding-top untuk fixed header di mobile saja */}
      <div className="pt-23 lg:pt-8 mx-auto p-6 space-y-6">
        {/* stats */}
        <div className=" grid-cols-1 md:grid-cols-3 gap-4 hidden xl:grid">
          <StatCard
            icon={
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            }
            label="Total Tasks"
            value={stats.total}
          />
          <StatCard
            icon={
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            }
            label="In Progress"
            value={stats.inProgress}
          />
          <StatCard
            icon={
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            }
            label="Completed"
            value={stats.complete}
          />
        </div>

        {/* filters */}
        <div className="bg-white dark:bg-card rounded-xl p-6 border border-gray-200 dark:border-border">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  className="pl-10"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-[140px]">
                  <Flag className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* list */}
        <div className="space-y-4">
          {tasksLoading ? (
            <div className="bg-white dark:bg-card rounded-xl p-12 text-center border border-gray-200 dark:border-border">
              <Loader2 className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-spin" />
              <div className="text-gray-600 dark:text-gray-400">
                Loading tasks…
              </div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="bg-white dark:bg-card rounded-xl p-12 text-center border border-gray-200 dark:border-border">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-600 dark:text-gray-400">
                No tasks found
              </div>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                subjects={subjects}
                onOpenDetail={() => openDetail(task)}
                onToggleDone={() => toggleStatus(task)}
                getDaysUntilDue={getDaysUntilDue}
              />
            ))
          )}
        </div>

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
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-white dark:bg-card rounded-xl p-6 border border-gray-200 dark:border-border">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-100 dark:bg-gray-900/30 rounded-lg">
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
