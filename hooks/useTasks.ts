import { useState, useEffect, useCallback } from "react";

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

interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  createTask: (
    taskData: Omit<Task, "id" | "_id" | "createdAt" | "updatedAt">
  ) => Promise<Task>;
  updateTask: (id: string, taskData: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  refetch: () => void;
}

export const useTasks = (): UseTasksReturn => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/tasks");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch tasks");
      }

      if (data.success && data.data) {
        setTasks(data.data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(
    async (
      taskData: Omit<Task, "id" | "_id" | "createdAt" | "updatedAt">
    ): Promise<Task> => {
      try {
        const response = await fetch("/api/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(taskData),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to create task");
        }

        if (data.success && data.data) {
          const newTask = data.data;
          setTasks((prev) => [newTask, ...prev]);
          return newTask;
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error("Error creating task:", err);
        throw err;
      }
    },
    []
  );

  const updateTask = useCallback(
    async (id: string, taskData: Partial<Task>): Promise<Task> => {
      try {
        const response = await fetch(`/api/tasks/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(taskData),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to update task");
        }

        if (data.success && data.data) {
          const updatedTask = data.data;
          setTasks((prev) =>
            prev.map((task) =>
              task._id === id || task.id === id ? updatedTask : task
            )
          );
          return updatedTask;
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error("Error updating task:", err);
        throw err;
      }
    },
    []
  );

  const deleteTask = useCallback(async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete task");
      }

      if (data.success) {
        setTasks((prev) =>
          prev.filter((task) => task._id !== id && task.id !== id)
        );
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Error deleting task:", err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    refetch: fetchTasks,
  };
};
