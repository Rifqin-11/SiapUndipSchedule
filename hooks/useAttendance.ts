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

  // Calculate attendance percentage based on subjects data
  // Accepts subjects array to properly calculate based on meeting dates
  const calculateAttendancePercentage = (
    subjects?: Array<{
      specificDate?: string;
      meetingDates?: string[];
      attendanceDates?: string[];
    }>
  ): number => {
    if (!attendanceData) {
      return 0;
    }

    // If subjects array is provided, use accurate calculation
    if (subjects && subjects.length > 0) {
      let totalAttendedMeetings = 0;
      let totalPossibleMeetings = 0;

      subjects.forEach((subject) => {
        // Count attended meetings
        if (subject.attendanceDates && Array.isArray(subject.attendanceDates)) {
          totalAttendedMeetings += subject.attendanceDates.length;
        }

        // Calculate possible meetings based on subject type
        if (subject.specificDate) {
          // One-time subject: only 1 possible meeting
          totalPossibleMeetings += 1;
        } else if (
          subject.meetingDates &&
          Array.isArray(subject.meetingDates)
        ) {
          // Use actual meeting dates count
          totalPossibleMeetings += subject.meetingDates.length;
        } else {
          // Legacy fallback: assume 14 meetings
          totalPossibleMeetings += 14;
        }
      });

      if (totalPossibleMeetings === 0) {
        return 0;
      }

      const percentage = (totalAttendedMeetings / totalPossibleMeetings) * 100;
      return Math.min(Math.round(percentage), 100);
    }

    // Legacy fallback: if no subjects provided, use simple calculation
    // This is deprecated and should not be used
    const totalAttendanceRecords = attendanceData.totalRecords;
    const percentage = Math.min(totalAttendanceRecords * 7, 100); // Rough estimate

    console.warn(
      "calculateAttendancePercentage called without subjects data - using legacy fallback"
    );

    return Math.round(percentage);
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
