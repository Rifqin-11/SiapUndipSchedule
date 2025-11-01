"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSubjects } from "./useSubjects";
import { useTasks } from "./useTasks";
import { formatLocalDate } from "@/utils/date";

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
  subject?: { id: string; name: string; lecturer: string[] };
  createdAt: Date;
  updatedAt: Date;
  isCompleted?: boolean;
}

export interface WeeklyStats {
  weekStart: Date;
  weekEnd: Date;
  attendanceRate: number;
  completedTasks: number;
  totalTasks: number;
  taskCompletionRate: number;
  totalClasses: number;
  attendedClasses: number;
  missedClasses: number;
  upcomingTasks: number;
}

export const useWeeklyStats = () => {
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: subjects = [] } = useSubjects();
  const { data: tasks = [] } = useTasks();

  // Helper function untuk mendapatkan start dan end date dari minggu ini
  const getCurrentWeek = useCallback(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday

    const weekStart = new Date(now.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return { weekStart, weekEnd };
  }, []);

  // Helper function untuk menghitung kehadiran dalam seminggu
  const calculateAttendanceStats = useCallback(
    (weekStart: Date, weekEnd: Date) => {
      let totalClasses = 0;
      let attendedClasses = 0;
      let missedClasses = 0;

      subjects.forEach((subject) => {
        // Hanya hitung subject yang punya jadwal
        if (!subject.day || !subject.startTime || !subject.endTime) return;

        // Hitung berapa kali kelas seharusnya ada dalam minggu ini
        const dayMap: { [key: string]: number } = {
          Sunday: 0,
          Monday: 1,
          Tuesday: 2,
          Wednesday: 3,
          Thursday: 4,
          Friday: 5,
          Saturday: 6,
        };

        const subjectDay = dayMap[subject.day];
        if (subjectDay === undefined) return;

        // Cari tanggal kelas dalam minggu ini
        const classDate = new Date(weekStart);
        classDate.setDate(
          weekStart.getDate() + ((subjectDay - weekStart.getDay() + 7) % 7)
        );

        // Pastikan tanggal kelas dalam rentang minggu ini dan tidak di masa depan
        if (
          classDate >= weekStart &&
          classDate <= weekEnd &&
          classDate <= new Date()
        ) {
          totalClasses++;

          // Cek attendance dari attendanceDates array
          if (subject.attendanceDates && subject.attendanceDates.length > 0) {
            const classDateStr = formatLocalDate(classDate);
            const hasAttended = subject.attendanceDates.includes(classDateStr);

            if (hasAttended) {
              attendedClasses++;
            } else {
              missedClasses++;
            }
          } else {
            // Jika tidak ada attendanceDates, anggap belum hadir
            missedClasses++;
          }
        }
      });

      const attendanceRate =
        totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;

      return {
        totalClasses,
        attendedClasses,
        missedClasses,
        attendanceRate,
      };
    },
    [subjects]
  );

  // Helper function untuk menghitung statistik tugas dalam seminggu
  const calculateTaskStats = useCallback(
    (weekStart: Date, weekEnd: Date) => {
      let totalTasks = 0;
      let completedTasks = 0;
      let upcomingTasks = 0;

      tasks.forEach((task: Task) => {
        const taskDueDate = new Date(task.dueDate);

        // Tugas yang jatuh tempo dalam minggu ini
        if (taskDueDate >= weekStart && taskDueDate <= weekEnd) {
          totalTasks++;

          // Check if task is completed based on status
          if (task.status === "completed") {
            completedTasks++;
          } else if (taskDueDate > new Date()) {
            // Tugas yang belum selesai dan masih upcoming
            upcomingTasks++;
          }
        }
      });

      const taskCompletionRate =
        totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      return {
        totalTasks,
        completedTasks,
        taskCompletionRate,
        upcomingTasks,
      };
    },
    [tasks]
  );

  // Calculate weekly stats
  const calculateWeeklyStats = useCallback(() => {
    setIsLoading(true);

    try {
      const { weekStart, weekEnd } = getCurrentWeek();
      const attendanceStats = calculateAttendanceStats(weekStart, weekEnd);
      const taskStats = calculateTaskStats(weekStart, weekEnd);

      const stats: WeeklyStats = {
        weekStart,
        weekEnd,
        ...attendanceStats,
        ...taskStats,
      };

      setWeeklyStats(stats);
    } catch (error) {
      console.error("Error calculating weekly stats:", error);
      setWeeklyStats(null);
    } finally {
      setIsLoading(false);
    }
  }, [getCurrentWeek, calculateAttendanceStats, calculateTaskStats]);

  // Recalculate when subjects or tasks change
  useEffect(() => {
    // Add debouncing to prevent excessive recalculations
    const timeoutId = setTimeout(() => {
      calculateWeeklyStats();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [subjects, tasks]); // Change dependency to actual data instead of callback

  // Generate summary message untuk notification
  const generateWeeklySummary = useMemo(() => {
    if (!weeklyStats) return null;

    const {
      attendanceRate,
      taskCompletionRate,
      totalClasses,
      totalTasks,
      upcomingTasks,
    } = weeklyStats;

    // Format dates
    const weekStartStr = weeklyStats.weekStart.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
    const weekEndStr = weeklyStats.weekEnd.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });

    // Generate attendance summary
    let attendanceSummary = "";
    if (totalClasses > 0) {
      if (attendanceRate >= 80) {
        attendanceSummary = `🎉 Kehadiran sangat baik (${attendanceRate.toFixed(
          0
        )}%)`;
      } else if (attendanceRate >= 60) {
        attendanceSummary = `📚 Kehadiran cukup baik (${attendanceRate.toFixed(
          0
        )}%)`;
      } else {
        attendanceSummary = `⚠️ Kehadiran perlu ditingkatkan (${attendanceRate.toFixed(
          0
        )}%)`;
      }
    } else {
      attendanceSummary = "📅 Tidak ada kelas minggu ini";
    }

    // Generate task summary
    let taskSummary = "";
    if (totalTasks > 0) {
      if (taskCompletionRate >= 80) {
        taskSummary = `✅ Tugas hampir semua selesai (${taskCompletionRate.toFixed(
          0
        )}%)`;
      } else if (taskCompletionRate >= 50) {
        taskSummary = `📝 Separuh tugas sudah selesai (${taskCompletionRate.toFixed(
          0
        )}%)`;
      } else {
        taskSummary = `📋 Masih banyak tugas yang perlu dikerjakan (${taskCompletionRate.toFixed(
          0
        )}%)`;
      }

      if (upcomingTasks > 0) {
        taskSummary += ` • ${upcomingTasks} tugas upcoming`;
      }
    } else {
      taskSummary = "🎯 Tidak ada tugas minggu ini";
    }

    return {
      title: `📊 Ringkasan Mingguan ${weekStartStr} - ${weekEndStr}`,
      message: `${attendanceSummary}\n${taskSummary}`,
      attendanceRate: attendanceRate.toFixed(0),
      taskCompletionRate: taskCompletionRate.toFixed(0),
      details: {
        attendance: `${weeklyStats.attendedClasses}/${totalClasses} kelas dihadiri`,
        tasks: `${weeklyStats.completedTasks}/${totalTasks} tugas selesai`,
      },
    };
  }, [weeklyStats]); // Keep only weeklyStats dependency

  // Wrap generateWeeklySummary in a callback for external use
  const getWeeklySummary = useCallback(
    () => generateWeeklySummary,
    [generateWeeklySummary]
  );

  return {
    weeklyStats,
    isLoading,
    calculateWeeklyStats,
    generateWeeklySummary: getWeeklySummary,
    refreshStats: calculateWeeklyStats,
  };
};
