import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to delete task");
  }
};

// React Query hooks
export const useTasks = () => {
  return useQuery({
    queryKey: TASKS_QUERY_KEY,
    queryFn: fetchTasks,
    staleTime: 2 * 60 * 1000, // 2 minutes - tasks berubah lebih sering
    gcTime: 5 * 60 * 1000, // 5 minutes cache time
    refetchOnWindowFocus: false,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTaskAPI,
    onSuccess: () => {
      // Invalidate tasks query untuk refresh data
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTaskAPI,
    onSuccess: () => {
      // Invalidate tasks query untuk refresh data
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTaskAPI,
    onSuccess: () => {
      // Invalidate tasks query untuk refresh data
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
