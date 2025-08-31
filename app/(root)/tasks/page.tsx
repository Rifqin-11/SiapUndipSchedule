"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubjectCombobox } from "@/components/ui/subject-combobox";
import {
  CheckCircle,
  Clock,
  Plus,
  Calendar,
  AlertCircle,
  BookOpen,
  Search,
  Filter,
  Edit,
  Trash2,
  Flag,
  Loader2,
  LinkIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useTasks } from "@/hooks/useTasks";
import { useSubjectsForTasks } from "@/hooks/useSubjectsForTasks";

interface Subject {
  id: string;
  name: string;
  lecturer: string[];
}

interface Task {
  _id?: string;
  id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "completed";
  dueDate: string;
  dueTime?: string;
  submissionLink?: string;
  subjectId?: string;
  subject?: Subject;
  createdAt: Date;
  updatedAt: Date;
}

const TasksPage = () => {
  const {
    tasks,
    loading: tasksLoading,
    createTask,
    updateTask,
    deleteTask,
  } = useTasks();
  const { subjects, loading: subjectsLoading } = useSubjectsForTasks();

  // Debug log
  React.useEffect(() => {
    console.log("Subjects in TasksPage:", subjects);
    console.log("Subjects loading:", subjectsLoading);
  }, [subjects, subjectsLoading]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
    status: "pending" | "in-progress" | "completed";
    dueDate: string;
    dueTime: string;
    submissionLink: string;
    subjectId: string;
  }>({
    title: "",
    description: "",
    priority: "medium",
    status: "pending",
    dueDate: "",
    dueTime: "",
    submissionLink: "",
    subjectId: "",
  });

  const handleOpenModal = useCallback(() => {
    setEditingTask(null);
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      status: "pending",
      dueDate: "",
      dueTime: "",
      submissionLink: "",
      subjectId: "",
    });
    setIsModalOpen(true);
  }, []);

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);

    // Split dueDate if it contains time information
    const [date, time] = task.dueDate.includes("T")
      ? task.dueDate.split("T")
      : [task.dueDate, task.dueTime || ""];

    setFormData({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      status: task.status,
      dueDate: date,
      dueTime: time.replace("Z", "").substring(0, 5) || "",
      submissionLink: task.submissionLink || "",
      subjectId: task.subjectId || "",
    });
    setIsModalOpen(true);
  }, []);

  const handleDeleteTask = useCallback((task: Task) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  }, []);

  const confirmDeleteTask = useCallback(async () => {
    if (!taskToDelete) return;

    try {
      await deleteTask(taskToDelete._id || taskToDelete.id);
      toast.success("Task deleted successfully!");
      setIsDeleteModalOpen(false);
      setTaskToDelete(null);
    } catch {
      toast.error("Failed to delete task");
    }
  }, [deleteTask, taskToDelete]);

  const cancelDeleteTask = useCallback(() => {
    setIsDeleteModalOpen(false);
    setTaskToDelete(null);
  }, []);

  const handleToggleStatus = useCallback(
    async (task: Task) => {
      try {
        const newStatus = task.status === "completed" ? "pending" : "completed";
        await updateTask(task._id || task.id, { status: newStatus });
        toast.success("Task status updated!");
      } catch {
        toast.error("Failed to update task status");
      }
    },
    [updateTask]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!formData.title.trim()) {
        toast.error("Task title is required");
        return;
      }

      if (!formData.dueDate) {
        toast.error("Due date is required");
        return;
      }

      setIsSubmitting(true);

      try {
        // Combine date and time
        const combinedDateTime = formData.dueTime
          ? `${formData.dueDate}T${formData.dueTime}:00`
          : formData.dueDate;

        const taskData = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          priority: formData.priority,
          status: formData.status,
          dueDate: combinedDateTime,
          dueTime: formData.dueTime,
          submissionLink: formData.submissionLink.trim() || undefined,
          subjectId:
            formData.subjectId && formData.subjectId.trim() !== ""
              ? formData.subjectId
              : undefined,
        };

        if (editingTask) {
          await updateTask(editingTask._id || editingTask.id, taskData);
          toast.success("Task updated successfully!");
        } else {
          await createTask(taskData);
          toast.success("Task created successfully!");
        }

        setIsModalOpen(false);
      } catch {
        toast.error(
          editingTask ? "Failed to update task" : "Failed to create task"
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, editingTask, createTask, updateTask]
  );

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "all" || task.status === filterStatus;
      const matchesPriority =
        filterPriority === "all" || task.priority === filterPriority;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchTerm, filterStatus, filterPriority]);

  const taskStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const inProgress = tasks.filter((t) => t.status === "in-progress").length;
    const pending = tasks.filter((t) => t.status === "pending").length;

    return { total, completed, inProgress, pending };
  }, [tasks]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30";
      case "medium":
        return "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30";
      case "low":
        return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30";
      case "in-progress":
        return "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30";
      case "pending":
        return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30";
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Tasks
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your assignments and study tasks
          </p>
        </div>
        <Button
          onClick={handleOpenModal}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-card rounded-xl p-6 border border-gray-200 dark:border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Tasks
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {taskStats.total}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-card rounded-xl p-6 border border-gray-200 dark:border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Completed
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {taskStats.completed}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-card rounded-xl p-6 border border-gray-200 dark:border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                In Progress
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {taskStats.inProgress}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-card rounded-xl p-6 border border-gray-200 dark:border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-900/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Pending
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {taskStats.pending}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-card rounded-xl p-6 border border-gray-200 dark:border-border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
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
                <SelectItem value="pending">Pending</SelectItem>
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

      {/* Tasks List */}
      <div className="space-y-4">
        {tasksLoading ? (
          <div className="bg-white dark:bg-card rounded-xl p-12 text-center border border-gray-200 dark:border-border">
            <Loader2 className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Loading tasks...
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we fetch your tasks
            </p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-white dark:bg-card rounded-xl p-12 text-center border border-gray-200 dark:border-border">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No tasks found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || filterStatus !== "all" || filterPriority !== "all"
                ? "Try adjusting your search or filters"
                : "Create your first task to get started"}
            </p>
            {!searchTerm &&
              filterStatus === "all" &&
              filterPriority === "all" && (
                <Button onClick={handleOpenModal}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              )}
          </div>
        ) : (
          filteredTasks.map((task) => {
            const daysUntilDue = getDaysUntilDue(task.dueDate);
            const isOverdue = daysUntilDue < 0;
            const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0;

            return (
              <div
                key={task.id}
                className="bg-white dark:bg-card rounded-xl p-6 border border-gray-200 dark:border-border hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <button
                      onClick={() => handleToggleStatus(task)}
                      className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        task.status === "completed"
                          ? "bg-green-500 border-green-500"
                          : "border-gray-300 dark:border-gray-600 hover:border-green-500"
                      }`}
                    >
                      {task.status === "completed" && (
                        <CheckCircle className="w-3 h-3 text-white" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3
                          className={`text-lg font-semibold ${
                            task.status === "completed"
                              ? "line-through text-gray-500 dark:text-gray-400"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {task.title}
                        </h3>

                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>

                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            task.status
                          )}`}
                        >
                          {task.status.replace("-", " ")}
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                            {task.dueTime && ` at ${task.dueTime}`}
                          </span>
                          {isOverdue && (
                            <span className="text-red-500 font-medium">
                              (Overdue)
                            </span>
                          )}
                          {isDueSoon && !isOverdue && (
                            <span className="text-yellow-500 font-medium">
                              ({daysUntilDue} day{daysUntilDue !== 1 ? "s" : ""}{" "}
                              left)
                            </span>
                          )}
                        </div>

                        {task.subject && (
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            <span className="text-blue-600 dark:text-blue-400">
                              {task.subject.name}
                            </span>
                          </div>
                        )}

                        {task.submissionLink && (
                          <div className="flex items-center gap-1">
                            <LinkIcon className="w-4 h-4" />
                            <a
                              href={task.submissionLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                            >
                              Submission Link
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTask(task)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTask(task)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Task Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          className="sm:max-w-[500px] w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto z-[50]"
          style={{ zIndex: 50 }}
        >
          <DialogHeader>
            <DialogTitle>
              {editingTask ? "Edit Task" : "Add New Task"}
            </DialogTitle>
            <DialogDescription>
              {editingTask
                ? "Update the task details below."
                : "Create a new task to track your progress."}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 w-full max-w-full overflow-hidden"
          >
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter task title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Optional description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      priority: value as "low" | "medium" | "high",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[70]">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      status: value as "pending" | "in-progress" | "completed",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[70]">
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueTime">Due Time (Optional)</Label>
                <Input
                  id="dueTime"
                  type="time"
                  value={formData.dueTime}
                  onChange={(e) =>
                    setFormData({ ...formData, dueTime: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="submissionLink">Submission Link (Optional)</Label>
              <Input
                id="submissionLink"
                type="url"
                placeholder="https://classroom.google.com/..."
                value={formData.submissionLink}
                onChange={(e) =>
                  setFormData({ ...formData, submissionLink: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Related Subject (Optional)</Label>
              {subjectsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Loading subjects...
                </div>
              ) : (
                <div className="w-full">
                  <SubjectCombobox
                    subjects={subjects}
                    value={formData.subjectId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, subjectId: value })
                    }
                    placeholder="Select a subject (optional)"
                    className="w-full max-w-full"
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {editingTask ? "Updating..." : "Creating..."}
                  </>
                ) : editingTask ? (
                  "Update Task"
                ) : (
                  "Create Task"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this task? This action cannot be
              undone.
            </div>
          </DialogHeader>

          {taskToDelete && (
            <div className="py-4">
              <div className="font-medium text-gray-900 dark:text-gray-100">
                {taskToDelete.title}
              </div>
              {taskToDelete.description && (
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {taskToDelete.description}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={cancelDeleteTask}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDeleteTask}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TasksPage;
