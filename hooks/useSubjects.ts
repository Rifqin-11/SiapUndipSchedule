import { useState, useEffect, useCallback, useRef } from "react";

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

// Simple cache to prevent multiple API calls
const subjectsCache = {
  data: null as Subject[] | null,
  timestamp: 0,
  ttl: 5 * 60 * 1000, // 5 minutes cache
};

export const useSubjects = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Prevent multiple simultaneous requests
  const isLoadingRef = useRef(false);

  const fetchSubjects = useCallback(async () => {
    // Check cache first
    const now = Date.now();
    if (
      subjectsCache.data &&
      now - subjectsCache.timestamp < subjectsCache.ttl
    ) {
      if (process.env.NODE_ENV === "development") {
        console.log("Using cached subjects data");
      }
      setSubjects(subjectsCache.data);
      setLoading(false);
      return;
    }

    // Prevent multiple concurrent requests
    if (isLoadingRef.current) {
      if (process.env.NODE_ENV === "development") {
        console.log("Request already in progress, skipping...");
      }
      return;
    }

    isLoadingRef.current = true;

    try {
      setLoading(true);
      setError(null);

      if (process.env.NODE_ENV === "development") {
        console.log("Fetching subjects from API...");
      }

      const response = await fetch("/api/subjects", {
        credentials: "include", // Include cookies for authentication
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Authentication required");
        } else {
          setError("Gagal mengambil data mata kuliah");
        }
        setSubjects([]);
        return;
      }

      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        // Ensure each subject has proper ID mapping
        const mappedSubjects = result.data.map(
          (subject: Subject & { _id?: string }) => ({
            ...subject,
            id: subject._id || subject.id, // Use _id as primary, fallback to id
          })
        );

        // Update cache
        subjectsCache.data = mappedSubjects;
        subjectsCache.timestamp = now;

        setSubjects(mappedSubjects);
        setError(null);
      } else {
        setError("Format data tidak valid");
        setSubjects([]);
      }
    } catch (err) {
      console.error("Error fetching subjects:", err);
      setError("Terjadi kesalahan saat mengambil data");
      setSubjects([]);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, []);

  const createSubject = async (subjectData: Omit<Subject, "_id">) => {
    try {
      const response = await fetch("/api/subjects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for authentication
        body: JSON.stringify(subjectData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication required");
        }
        throw new Error("Failed to create subject");
      }

      const newSubject = await response.json();
      setSubjects((prev) => [...prev, newSubject]);
      return { success: true, data: newSubject };
    } catch (err) {
      console.error("Error creating subject:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  };

  const updateSubject = async (
    id: string,
    subjectData: Omit<Subject, "_id">
  ) => {
    try {
      const response = await fetch(`/api/subjects/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for authentication
        body: JSON.stringify(subjectData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication required");
        }
        throw new Error("Failed to update subject");
      }

      const updatedSubject = await response.json();
      setSubjects((prev) =>
        prev.map((s) => (s.id === id ? updatedSubject : s))
      );
      return { success: true, data: updatedSubject };
    } catch (err) {
      console.error("Error updating subject:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  };

  const deleteSubject = async (id: string) => {
    try {
      const response = await fetch(`/api/subjects/${id}`, {
        method: "DELETE",
        credentials: "include", // Include cookies for authentication
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication required");
        }
        throw new Error("Failed to delete subject");
      }

      setSubjects((prev) => prev.filter((s) => s.id !== id));
      return { success: true };
    } catch (err) {
      console.error("Error deleting subject:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  };

  const deleteAllSubjects = async () => {
    try {
      const response = await fetch("/api/subjects/delete-all", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete all subjects");
      }

      const result = await response.json();

      if (result.success) {
        setSubjects([]);
        return { success: true, deletedCount: result.deletedCount };
      } else {
        throw new Error(result.error || "Failed to delete all subjects");
      }
    } catch (err) {
      console.error("Error deleting all subjects:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  };

  // Provide refresh function for manual updates
  const refresh = useCallback(() => {
    subjectsCache.data = null; // Clear cache
    fetchSubjects();
  }, [fetchSubjects]);

  useEffect(() => {
    fetchSubjects();

    // Listen for custom refresh events
    const handleSubjectsUpdated = () => {
      if (process.env.NODE_ENV === "development") {
        console.log("Subjects updated event received, refetching...");
      }
      refresh();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("subjectsUpdated", handleSubjectsUpdated);

      // Also listen for storage changes
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === "lastUpdateTime") {
          if (process.env.NODE_ENV === "development") {
            console.log("Storage update detected, refetching...");
          }
          refresh();
        }
      };

      window.addEventListener("storage", handleStorageChange);

      return () => {
        window.removeEventListener("subjectsUpdated", handleSubjectsUpdated);
        window.removeEventListener("storage", handleStorageChange);
      };
    }
  }, [fetchSubjects, refresh]);

  return {
    subjects,
    loading,
    error,
    refetch: refresh, // Use refresh instead of fetchSubjects
    createSubject,
    updateSubject,
    deleteSubject,
    deleteAllSubjects,
  };
};

export const useSubject = (id: string) => {
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/subjects/${id}`, {
          credentials: "include", // Include cookies for authentication
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError("Mata kuliah tidak ditemukan");
          } else if (response.status === 401) {
            setError("Authentication required");
          } else {
            setError("Gagal mengambil data mata kuliah");
          }
          setSubject(null);
          return;
        }

        const result = await response.json();

        if (result.success && result.data) {
          // Ensure we use _id as the primary identifier
          const subjectData = {
            ...result.data,
            id: result.data._id || result.data.id,
          };
          setSubject(subjectData);
          setError(null);
        } else {
          setError("Data mata kuliah tidak valid");
          setSubject(null);
        }
      } catch (err) {
        console.error("Error fetching subject:", err);
        setError("Terjadi kesalahan saat mengambil data");
        setSubject(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSubject();
    }
  }, [id]);

  return { subject, loading, error };
};
