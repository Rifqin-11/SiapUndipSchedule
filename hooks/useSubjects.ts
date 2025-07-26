import { useState, useEffect } from "react";
import { dummySubject } from "@/constants";

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
      const response = await fetch("/api/subjects");
      if (!response.ok) {
        // Fallback to dummy data if API fails
        console.warn("API failed, using dummy data");
        setSubjects(dummySubject);
        setError(null);
        return;
      }
      const data = await response.json();
      setSubjects(data);
      setError(null);
    } catch (err) {
      console.warn("Error fetching from API, using dummy data:", err);
      // Fallback to dummy data
      setSubjects(dummySubject);
      setError(null);
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
        const response = await fetch(`/api/subjects/${id}`);
        if (!response.ok) {
          // Fallback to dummy data
          const fallbackSubject = dummySubject.find((s) => s.id === id);
          setSubject(fallbackSubject || null);
          setError(null);
          return;
        }
        const data = await response.json();
        setSubject(data);
        setError(null);
      } catch (err) {
        console.warn("Error fetching subject from API, using dummy data:", err);
        // Fallback to dummy data
        const fallbackSubject = dummySubject.find((s) => s.id === id);
        setSubject(fallbackSubject || null);
        setError(null);
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
