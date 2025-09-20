import { useState, useEffect } from "react";

interface AttendanceRecord {
  id: string;
  subjectId: string;
  subjectName: string;
  attendanceDate: Date;
  location: string;
  notes: string;
  createdAt: Date;
}

interface AttendanceData {
  history: AttendanceRecord[];
  groupedHistory: Record<string, AttendanceRecord[]>;
  totalRecords: number;
}

export function useAttendance() {
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendanceHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/attendance-history", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch attendance history");
      }

      const result = await response.json();

      if (result.success) {
        setAttendanceData(result.data);
      } else {
        throw new Error(result.error || "Failed to fetch attendance data");
      }
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Calculate attendance percentage based on subjects count
  const calculateAttendancePercentage = (totalSubjects: number): number => {
    if (!attendanceData || totalSubjects === 0) {
      return 0;
    }

    const totalAttendanceRecords = attendanceData.totalRecords;
    const totalPossibleMeetings = totalSubjects * 14; // 14 meetings per subject

    if (totalPossibleMeetings === 0) {
      return 0;
    }

    // Formula: (total attendance / (total subjects × 14)) × 100%
    const percentage = (totalAttendanceRecords / totalPossibleMeetings) * 100;

    // Debug log
    console.log("Attendance Calculation:", {
      totalAttendanceRecords,
      totalSubjects,
      totalPossibleMeetings,
      rawPercentage: percentage,
      finalPercentage: Math.min(Math.round(percentage), 100),
    });

    return Math.min(Math.round(percentage), 100); // Cap at 100%
  };

  useEffect(() => {
    fetchAttendanceHistory();
  }, []);

  return {
    attendanceData,
    loading,
    error,
    refetch: fetchAttendanceHistory,
    calculateAttendancePercentage,
  };
}
