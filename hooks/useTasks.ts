import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchWithCacheBusting,
  createCacheBustingHeaders,
} from "@/lib/cache-buster";

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

// Query keys
export const TASKS_QUERY_KEY = ["tasks"] as const;

// API functions
const fetchTasks = async (): Promise<Task[]> => {
  const response = await fetch("/api/tasks", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch tasks");
  }

  const data = await response.json();
  return data.data;
};

const createTaskAPI = async (
  taskData: Omit<Task, "id" | "_id" | "createdAt" | "updatedAt">
): Promise<Task> => {
  const response = await fetch("/api/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...createCacheBustingHeaders(),
    },
    credentials: "include",
    body: JSON.stringify(taskData),
  });

  if (!response.ok) {
    throw new Error("Failed to create task");
  }

  const data = await response.json();
  return data.data;
};

const updateTaskAPI = async ({
  id,
  taskData,
}: {
  id: string;
  taskData: Partial<Task>;
}): Promise<Task> => {
  const response = await fetch(`/api/tasks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...createCacheBustingHeaders(),
    },
    credentials: "include",
    body: JSON.stringify(taskData),
  });

  if (!response.ok) {
    throw new Error("Failed to update task");
  }

  const data = await response.json();
  return data.data;
};

const deleteTaskAPI = async (id: string): Promise<void> => {
  const response = await fetch(`/api/tasks/${id}`, {
    method: "DELETE",
    headers: {
      ...createCacheBustingHeaders(),
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to delete task");
  }
};

// React Query hooks
export const useTasks = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: TASKS_QUERY_KEY,
    queryFn: fetchTasks,
    enabled: options?.enabled ?? true, // Allow conditional fetching
    staleTime: 30 * 1000, // 30 seconds - allow using cached data for faster loading
    gcTime: 5 * 60 * 1000, // 5 minutes cache time
    refetchOnWindowFocus: false,
    refetchOnReconnect: true, // Refetch saat reconnect
    refetchOnMount: false, // Don't refetch on mount for faster loading
    refetchInterval: false, // Disable auto refetch interval
    retry: (failureCount, error) => {
      // Don't retry on auth errors to avoid delay
      const message = error instanceof Error ? error.message : "";
      if (message.includes("401") || message.includes("403")) {
        return false;
      }
      return failureCount < 2; // Reduce retry attempts for faster failure
    },
  });
};

export const useCreateTask = (options?: {
  onAutoSyncSuccess?: (task: Task) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTaskAPI,
    onSuccess: (newTask) => {
      // Update cache dengan task baru
      queryClient.setQueryData<Task[]>(TASKS_QUERY_KEY, (old = []) => {
        // Tambah task baru di awal array
        return [newTask, ...old];
      });

      // Trigger auto-sync callback if provided
      if (options?.onAutoSyncSuccess) {
        options.onAutoSyncSuccess(newTask);
      }
    },
    onError: (error) => {
      console.error("Create task error:", error);
    },
    onSettled: async () => {
      // Background refetch setelah delay kecil
      await new Promise((resolve) => setTimeout(resolve, 100));
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });
};

export const useUpdateTask = (options?: {
  onAutoSyncSuccess?: (task: Task) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTaskAPI,
    onMutate: async ({ id, taskData }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });

      // Snapshot previous value
      const previousTasks = queryClient.getQueryData<Task[]>(TASKS_QUERY_KEY);

      // Optimistically update to new value
      queryClient.setQueryData<Task[]>(TASKS_QUERY_KEY, (old = []) => {
        return old.map((task) => {
          const taskIdentifier = task._id || task.id;
          return taskIdentifier === id ? { ...task, ...taskData } : task;
        });
      });

      return { previousTasks };
    },
    onSuccess: (updatedTask) => {
      // Update cache dengan data dari server
      queryClient.setQueryData<Task[]>(TASKS_QUERY_KEY, (old = []) => {
        return old.map((task) => {
          const taskIdentifier = task._id || task.id;
          const updatedIdentifier = updatedTask._id || updatedTask.id;
          return taskIdentifier === updatedIdentifier ? updatedTask : task;
        });
      });

      // Trigger auto-sync callback if provided
      if (options?.onAutoSyncSuccess) {
        options.onAutoSyncSuccess(updatedTask);
      }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(TASKS_QUERY_KEY, context.previousTasks);
      }
    },
    onSettled: async () => {
      // Background refetch setelah delay kecil
      await new Promise((resolve) => setTimeout(resolve, 100));
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTaskAPI,
    onMutate: async (taskId) => {
      // Cancel outgoing refetches untuk menghindari race condition
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });

      // Snapshot previous value untuk rollback jika error
      const previousTasks = queryClient.getQueryData<Task[]>(TASKS_QUERY_KEY);

      // Optimistically remove task - Ini yang membuat task langsung hilang di UI
      queryClient.setQueryData<Task[]>(TASKS_QUERY_KEY, (old = []) => {
        return old.filter((task) => {
          const taskIdentifier = task._id || task.id;
          return taskIdentifier !== taskId;
        });
      });

      return { previousTasks };
    },
    onSuccess: () => {
      // Invalidate tanpa refetch, biarkan data optimistic tetap
      // Background sync akan terjadi nanti
      queryClient.invalidateQueries({
        queryKey: TASKS_QUERY_KEY,
        refetchType: "none",
      });
    },
    onError: (err, variables, context) => {
      // Rollback on error - kembalikan data sebelumnya
      if (context?.previousTasks) {
        queryClient.setQueryData(TASKS_QUERY_KEY, context.previousTasks);
      }
    },
    onSettled: async () => {
      // Background refetch untuk sinkronisasi dengan server
      // Gunakan setTimeout untuk menghindari blocking UI
      await new Promise((resolve) => setTimeout(resolve, 100));
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });
};

// Hook untuk mendapatkan single task by ID
export const useTask = (id: string) => {
  return useQuery({
    queryKey: ["task", id],
    queryFn: async (): Promise<Task> => {
      const response = await fetch(`/api/tasks/${id}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch task");
      }

      const data = await response.json();
      return data.data;
    },
    enabled: !!id, // Hanya fetch jika id ada
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// Utility functions untuk filtering tasks
export const getTasksByStatus = (
  tasks: Task[],
  status: Task["status"]
): Task[] => {
  return tasks.filter((task) => task.status === status);
};

export const getTasksByPriority = (
  tasks: Task[],
  priority: Task["priority"]
): Task[] => {
  return tasks.filter((task) => task.priority === priority);
};

export const getTasksBySubject = (tasks: Task[], subjectId: string): Task[] => {
  return tasks.filter((task) => task.subjectId === subjectId);
};

export const getOverdueTasks = (tasks: Task[]): Task[] => {
  const now = new Date();
  return tasks.filter((task) => {
    if (task.status === "completed") return false;

    const dueDate = new Date(task.dueDate);
    if (task.dueTime) {
      const [hours, minutes] = task.dueTime.split(":").map(Number);
      dueDate.setHours(hours, minutes, 0, 0);
    }

    return dueDate < now;
  });
};

export const getUpcomingTasks = (tasks: Task[], days: number = 7): Task[] => {
  const now = new Date();
  const future = new Date();
  future.setDate(now.getDate() + days);

  return tasks.filter((task) => {
    if (task.status === "completed") return false;

    const dueDate = new Date(task.dueDate);
    return dueDate >= now && dueDate <= future;
  });
};

// Legacy compatibility hook
export const useTasksLegacy = () => {
  const { data: tasks = [], isLoading: loading, error } = useTasks();

  return {
    tasks,
    loading,
    error: error?.message || null,
    refetch: () => {
      // Placeholder untuk compatibility
    },
  };
};

// Export types
export type { Task, Subject };
