import { useState, useEffect } from "react";

interface Subject {
  id: string;
  name: string;
  lecturer: string[];
  day?: string;
  specificDate?: string;
  room?: string;
  startTime?: string;
  endTime?: string;
}

interface UseSubjectsReturn {
  subjects: Subject[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useSubjectsForTasks = (): UseSubjectsReturn => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/subjects");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch subjects");
      }

      if (data.success && data.data) {
        setSubjects(data.data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Error fetching subjects:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch subjects");
    } finally {
      setLoading(false);
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
  };
};
