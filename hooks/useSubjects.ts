import { useState, useEffect } from "react";

export interface Subject {
  _id?: string;
  id: string;
  name: string;
  day: string;
  room: string;
  startTime: string;
  endTime: string;
  lecturer: string[];
  meeting: number;
  category?: string;
}

export const useSubjects = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/subjects");

      if (!response.ok) {
        setError("Gagal mengambil data mata kuliah");
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
    }
  };

  const createSubject = async (subjectData: Omit<Subject, "_id">) => {
    try {
      const response = await fetch("/api/subjects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subjectData),
      });

      if (!response.ok) {
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
        body: JSON.stringify(subjectData),
      });

      if (!response.ok) {
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
      });

      if (!response.ok) {
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

  useEffect(() => {
    fetchSubjects();
    
    // Listen for custom refresh events
    const handleSubjectsUpdated = () => {
      console.log("Subjects updated event received, refetching...");
      fetchSubjects();
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('subjectsUpdated', handleSubjectsUpdated);
      
      // Also listen for storage changes
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'lastUpdateTime') {
          console.log("Storage update detected, refetching...");
          fetchSubjects();
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      
      return () => {
        window.removeEventListener('subjectsUpdated', handleSubjectsUpdated);
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, []);

  return {
    subjects,
    loading,
    error,
    refetch: fetchSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
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

        const response = await fetch(`/api/subjects/${id}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError("Mata kuliah tidak ditemukan");
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
