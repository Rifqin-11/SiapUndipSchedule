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
  try {
    const response = await fetchWithCacheBusting("/api/tasks", {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch tasks");
    }

    const data = await response.json();

    // Ensure we always return an array
    if (!data || !data.data || !Array.isArray(data.data)) {
      console.warn("Invalid tasks data format:", data);
      return [];
    }

    return data.data;
  } catch (error) {
    console.error("Error in fetchTasks:", error);
    throw error;
  }
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
export const useTasks = () => {
  const result = useQuery({
    queryKey: TASKS_QUERY_KEY,
    queryFn: fetchTasks,
    staleTime: 0, // Always consider stale untuk fresh data setiap saat
    gcTime: 1 * 60 * 1000, // 1 minute cache time saja
    refetchOnWindowFocus: false,
    refetchOnReconnect: true, // Refetch saat reconnect
    refetchOnMount: "always", // Always refetch saat component mount
    refetchInterval: false, // Disable auto refetch interval
  });

  // Ensure data is always an array
  return {
    ...result,
    data: Array.isArray(result.data) ? result.data : [],
  };
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTaskAPI,
    onSuccess: (newTask) => {
      // Force update cache dengan data dari server
      queryClient.setQueryData(TASKS_QUERY_KEY, (old: Task[] = []) => {
        // Tambah task baru di awal array
        return [newTask, ...old];
      });

      // Force remove cache dan refetch untuk memastikan konsistensi
      queryClient.removeQueries({ queryKey: TASKS_QUERY_KEY, exact: false });
      queryClient.refetchQueries({
        queryKey: TASKS_QUERY_KEY,
        type: "active",
      });
    },
    onError: (error) => {
      console.error("Create task error:", error);
    },
    onSettled: () => {
      // Force invalidate dan refresh
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });

      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: TASKS_QUERY_KEY });
      }, 100);
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTaskAPI,
    onMutate: async ({ id, taskData }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });

      // Snapshot previous value
      const previousTasks = queryClient.getQueryData(TASKS_QUERY_KEY);

      // Optimistically update to new value
      queryClient.setQueryData(TASKS_QUERY_KEY, (old: Task[] = []) => {
        return old.map((task) =>
          task._id === id || task.id === id ? { ...task, ...taskData } : task
        );
      });

      return { previousTasks };
    },
    onSuccess: (updatedTask) => {
      // Force update cache dengan data dari server
      queryClient.setQueryData(TASKS_QUERY_KEY, (old: Task[] = []) => {
        return old.map((task) =>
          task._id === updatedTask._id || task.id === updatedTask.id
            ? updatedTask
            : task
        );
      });

      // Force refetch dengan bypass cache
      queryClient.refetchQueries({
        queryKey: TASKS_QUERY_KEY,
        type: "active",
      });
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(TASKS_QUERY_KEY, context.previousTasks);
      }
    },
    onSettled: () => {
      // Invalidate semua queries terkait
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });

      // Force remove dari cache untuk fresh fetch
      queryClient.removeQueries({ queryKey: TASKS_QUERY_KEY, exact: false });

      // Refetch dengan force
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: TASKS_QUERY_KEY });
      }, 100);
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTaskAPI,
    onMutate: async (taskId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });

      // Snapshot previous value
      const previousTasks = queryClient.getQueryData(TASKS_QUERY_KEY);

      // Optimistically remove task
      queryClient.setQueryData(TASKS_QUERY_KEY, (old: Task[] = []) => {
        return old.filter((task) => task._id !== taskId && task.id !== taskId);
      });

      return { previousTasks };
    },
    onSuccess: () => {
      // Force remove dari cache
      queryClient.removeQueries({ queryKey: TASKS_QUERY_KEY, exact: false });

      // Fresh fetch dari server dengan bypass cache
      queryClient.refetchQueries({
        queryKey: TASKS_QUERY_KEY,
        type: "active",
      });
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(TASKS_QUERY_KEY, context.previousTasks);
      }
    },
    onSettled: () => {
      // Force invalidate dan refresh
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });

      // Additional delay untuk memastikan server sudah update
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: TASKS_QUERY_KEY });
      }, 200);
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
