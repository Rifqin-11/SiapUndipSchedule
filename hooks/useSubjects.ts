import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchWithCacheBusting,
  createCacheBustingHeaders,
} from "@/lib/cache-buster";

export interface Subject {
  _id?: string;
  id: string;
  userId: string;
  name: string;
  day: string; // For recurring weekly subjects (legacy support)
  specificDate?: string; // For date-specific subjects (YYYY-MM-DD format)
  room: string;
  startTime: string;
  endTime: string;
  lecturer: string[];
  meeting: number;
  attendanceDates?: string[];
  reschedules?: {
    originalDate: Date;
    newDate: Date;
    reason: string;
    startTime?: string;
    endTime?: string;
    room?: string;
    createdAt: Date;
  }[];
  category?: string;
}

// Query keys
export const SUBJECTS_QUERY_KEY = ["subjects"] as const;

// API functions
const fetchSubjects = async (): Promise<Subject[]> => {
  try {
    const response = await fetchWithCacheBusting("/api/subjects", {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch subjects");
    }

    const data = await response.json();

    // Ensure we always return an array
    if (!data || !data.data || !Array.isArray(data.data)) {
      console.warn("Invalid subjects data format:", data);
      return [];
    }

    return data.data;
  } catch (error) {
    console.error("Error in fetchSubjects:", error);
    throw error;
  }
};

const deleteSubjectAPI = async (id: string): Promise<void> => {
  const response = await fetch(`/api/subjects/${id}`, {
    method: "DELETE",
    headers: {
      "Cache-Control": "no-cache",
      "X-Timestamp": Date.now().toString(), // Cache busting
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to delete subject");
  }
};

const deleteAllSubjectsAPI = async (): Promise<{ deletedCount: number }> => {
  const response = await fetch("/api/subjects/delete-all", {
    method: "DELETE",
    headers: {
      "Cache-Control": "no-cache",
      "X-Timestamp": Date.now().toString(), // Cache busting
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to delete all subjects");
  }

  const data = await response.json();
  return data;
};

const updateSubjectAPI = async ({
  id,
  subject,
}: {
  id: string;
  subject: Partial<Subject>;
}): Promise<Subject> => {
  const response = await fetch(`/api/subjects/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      "X-Timestamp": Date.now().toString(), // Cache busting
    },
    credentials: "include",
    body: JSON.stringify(subject),
  });

  if (!response.ok) {
    throw new Error("Failed to update subject");
  }

  const data = await response.json();
  return data.data;
};

const createSubjectAPI = async (
  subjectData: Omit<Subject, "id" | "_id">
): Promise<Subject> => {
  const response = await fetch("/api/subjects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      "X-Timestamp": Date.now().toString(), // Cache busting
    },
    credentials: "include",
    body: JSON.stringify(subjectData),
  });

  if (!response.ok) {
    throw new Error("Failed to create subject");
  }

  const data = await response.json();
  return data.data;
};

// React Query hooks
export const useSubjects = () => {
  const result = useQuery({
    queryKey: SUBJECTS_QUERY_KEY,
    queryFn: fetchSubjects,
    staleTime: 0, // Always consider stale untuk fresh data setiap saat
    gcTime: 2 * 60 * 1000, // 2 minutes cache time
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

export const useCreateSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSubjectAPI,
    onSuccess: (newSubject) => {
      // Force update cache dengan data dari server
      queryClient.setQueryData(SUBJECTS_QUERY_KEY, (old: Subject[] = []) => {
        // Tambah subject baru di awal array
        return [newSubject, ...old];
      });

      // Force remove cache dan refetch untuk memastikan konsistensi
      queryClient.removeQueries({ queryKey: SUBJECTS_QUERY_KEY, exact: false });
      queryClient.refetchQueries({
        queryKey: SUBJECTS_QUERY_KEY,
        type: "active",
      });
    },
    onError: (error) => {
      console.error("Create subject error:", error);
    },
    onSettled: () => {
      // Force invalidate dan refresh
      queryClient.invalidateQueries({ queryKey: SUBJECTS_QUERY_KEY });

      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: SUBJECTS_QUERY_KEY });
      }, 100);
    },
  });
};

export const useDeleteSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSubjectAPI,
    onMutate: async (subjectId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: SUBJECTS_QUERY_KEY });

      // Snapshot previous value
      const previousSubjects = queryClient.getQueryData(SUBJECTS_QUERY_KEY);

      // Optimistically remove subject
      queryClient.setQueryData(SUBJECTS_QUERY_KEY, (old: Subject[] = []) => {
        return old.filter(
          (subject) => subject._id !== subjectId && subject.id !== subjectId
        );
      });

      return { previousSubjects };
    },
    onSuccess: () => {
      // Force remove dari cache
      queryClient.removeQueries({ queryKey: SUBJECTS_QUERY_KEY, exact: false });

      // Fresh fetch dari server dengan bypass cache
      queryClient.refetchQueries({
        queryKey: SUBJECTS_QUERY_KEY,
        type: "active",
      });
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousSubjects) {
        queryClient.setQueryData(SUBJECTS_QUERY_KEY, context.previousSubjects);
      }
    },
    onSettled: () => {
      // Force invalidate dan refresh
      queryClient.invalidateQueries({ queryKey: SUBJECTS_QUERY_KEY });

      // Additional delay untuk memastikan server sudah update
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: SUBJECTS_QUERY_KEY });
      }, 200);
    },
  });
};

export const useUpdateSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSubjectAPI,
    onMutate: async ({ id, subject }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: SUBJECTS_QUERY_KEY });

      // Snapshot previous value
      const previousSubjects = queryClient.getQueryData(SUBJECTS_QUERY_KEY);

      // Optimistically update to new value
      queryClient.setQueryData(SUBJECTS_QUERY_KEY, (old: Subject[] = []) => {
        return old.map((s) =>
          s._id === id || s.id === id ? { ...s, ...subject } : s
        );
      });

      return { previousSubjects };
    },
    onSuccess: (updatedSubject) => {
      // Force update cache dengan data dari server
      queryClient.setQueryData(SUBJECTS_QUERY_KEY, (old: Subject[] = []) => {
        return old.map((subject) =>
          subject._id === updatedSubject._id || subject.id === updatedSubject.id
            ? updatedSubject
            : subject
        );
      });

      // Force refetch dengan bypass cache
      queryClient.refetchQueries({
        queryKey: SUBJECTS_QUERY_KEY,
        type: "active",
      });
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousSubjects) {
        queryClient.setQueryData(SUBJECTS_QUERY_KEY, context.previousSubjects);
      }
    },
    onSettled: () => {
      // Force remove dari cache untuk fresh fetch
      queryClient.removeQueries({ queryKey: SUBJECTS_QUERY_KEY, exact: false });

      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: SUBJECTS_QUERY_KEY });

      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: SUBJECTS_QUERY_KEY });
      }, 100);
    },
  });
};

export const useDeleteAllSubjects = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAllSubjectsAPI,
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: SUBJECTS_QUERY_KEY });

      // Snapshot previous value
      const previousSubjects = queryClient.getQueryData(SUBJECTS_QUERY_KEY);

      // Optimistically clear all subjects
      queryClient.setQueryData(SUBJECTS_QUERY_KEY, []);

      return { previousSubjects };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousSubjects) {
        queryClient.setQueryData(SUBJECTS_QUERY_KEY, context.previousSubjects);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: SUBJECTS_QUERY_KEY });
    },
  });
};

// Utility functions
export const getSubjectsByDay = (
  subjects: Subject[],
  day: string
): Subject[] => {
  return subjects.filter((subject) => {
    if (subject.specificDate) {
      // For date-specific subjects, check if the specific date matches the target day
      const subjectDate = new Date(subject.specificDate);
      const dayName = subjectDate.toLocaleDateString("en-US", {
        weekday: "long",
      });
      return dayName.toLowerCase() === day.toLowerCase();
    } else {
      // For weekly recurring subjects
      return subject.day.toLowerCase() === day.toLowerCase();
    }
  });
};

export const getSubjectsByDate = (
  subjects: Subject[],
  date: string
): Subject[] => {
  return subjects.filter((subject) => {
    if (subject.specificDate) {
      return subject.specificDate === date;
    } else {
      // For weekly recurring subjects, check day of week
      const targetDate = new Date(date);
      const dayName = targetDate.toLocaleDateString("en-US", {
        weekday: "long",
      });
      return subject.day.toLowerCase() === dayName.toLowerCase();
    }
  });
};

// Hook untuk mendapatkan single subject by ID
export const useSubject = (id: string) => {
  const result = useQuery({
    queryKey: ["subject", id],
    queryFn: async (): Promise<Subject> => {
      try {
        const response = await fetch(`/api/subjects/${id}`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch subject");
        }

        const data = await response.json();

        // Ensure we always return a valid subject object
        if (!data || !data.data) {
          throw new Error("Invalid subject data received");
        }

        return data.data;
      } catch (error) {
        console.error("Error in fetchSubject:", error);
        throw error;
      }
    },
    enabled: !!id, // Hanya fetch jika id ada
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return result;
};

// Legacy compatibility - untuk migration bertahap
export const useSubjectsLegacy = () => {
  const { data: subjects = [], isLoading: loading, error } = useSubjects();

  return {
    subjects,
    loading,
    error: error?.message || null,
    refetch: () => {
      // Placeholder untuk compatibility
    },
  };
};
