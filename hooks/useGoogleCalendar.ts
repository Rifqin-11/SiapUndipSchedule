import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { Subject } from "./useSubjects";
import type { Task } from "./useTasks";

interface GoogleCalendarTokens {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
}

export function useGoogleCalendar() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tokens, setTokens] = useState<GoogleCalendarTokens | null>(null);
  const [autoSync, setAutoSync] = useState(false);

  // Check if user is already connected and auto-sync preference
  useEffect(() => {
    const savedTokens = localStorage.getItem("google_calendar_tokens");
    if (savedTokens) {
      try {
        const parsedTokens = JSON.parse(savedTokens);
        setTokens(parsedTokens);
        setIsConnected(true);
      } catch (error) {
        console.error("Error parsing saved tokens:", error);
        localStorage.removeItem("google_calendar_tokens");
      }
    }

    // Load auto-sync preference
    const autoSyncPref = localStorage.getItem("google_calendar_auto_sync");
    if (autoSyncPref === "true") {
      setAutoSync(true);
    }
  }, []);

  // Connect to Google Calendar
  const connect = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/google-calendar/auth");
      const data = await response.json();

      if (data.authUrl) {
        // Open Google OAuth consent screen
        window.location.href = data.authUrl;
      } else {
        throw new Error("Failed to get authentication URL");
      }
    } catch (error: any) {
      console.error("Error connecting to Google Calendar:", error);
      toast.error("Gagal menghubungkan ke Google Calendar");
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect from Google Calendar
  const disconnect = () => {
    localStorage.removeItem("google_calendar_tokens");
    localStorage.removeItem("google_calendar_auto_sync");
    setTokens(null);
    setIsConnected(false);
    setAutoSync(false);
    toast.success("Berhasil memutuskan koneksi Google Calendar");
  };

  // Toggle auto-sync
  const toggleAutoSync = (enabled: boolean) => {
    setAutoSync(enabled);
    localStorage.setItem("google_calendar_auto_sync", enabled.toString());
    if (enabled) {
      toast.success("Auto-sync ke Google Calendar diaktifkan");
    } else {
      toast.info("Auto-sync ke Google Calendar dinonaktifkan");
    }
  };

  // Export schedule to Google Calendar (using meetingDates from subjects)
  const exportSchedule = async (subjects: Subject[]) => {
    if (!isConnected || !tokens) {
      toast.error("Silakan hubungkan dengan Google Calendar terlebih dahulu");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/google-calendar/export-schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subjects,
          tokens,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const successCount = data.results.filter((r: any) => r.success).length;
        toast.success(
          `Berhasil mengekspor ${successCount} event ke Google Calendar`
        );
        return data.results;
      } else {
        throw new Error(data.error || "Failed to export schedule");
      }
    } catch (error: any) {
      console.error("Error exporting schedule:", error);
      toast.error("Gagal mengekspor jadwal ke Google Calendar");
    } finally {
      setIsLoading(false);
    }
  };

  // Export single subject to Google Calendar
  const exportSubject = async (subject: Subject, selectedDate?: string) => {
    if (!isConnected || !tokens) {
      toast.error("Silakan hubungkan dengan Google Calendar terlebih dahulu");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/google-calendar/export-subject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject,
          selectedDate,
          tokens,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Berhasil menambahkan ke Google Calendar");
        return data.event;
      } else {
        throw new Error(data.error || "Failed to export subject");
      }
    } catch (error: any) {
      console.error("Error exporting subject:", error);
      toast.error("Gagal menambahkan ke Google Calendar");
    } finally {
      setIsLoading(false);
    }
  };

  // Export tasks to Google Calendar
  const exportTasks = async (tasks: Task[]) => {
    if (!isConnected || !tokens) {
      toast.error("Silakan hubungkan dengan Google Calendar terlebih dahulu");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/google-calendar/export-tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tasks,
          tokens,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const successCount = data.results.filter((r: any) => r.success).length;
        toast.success(
          `Berhasil mengekspor ${successCount} tugas ke Google Calendar`
        );
        return data.results;
      } else {
        throw new Error(data.error || "Failed to export tasks");
      }
    } catch (error: any) {
      console.error("Error exporting tasks:", error);
      toast.error("Gagal mengekspor tugas ke Google Calendar");
    } finally {
      setIsLoading(false);
    }
  };

  // Export single task to Google Calendar
  const exportTask = async (task: Task) => {
    if (!isConnected || !tokens) {
      toast.error("Silakan hubungkan dengan Google Calendar terlebih dahulu");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/google-calendar/export-task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          task,
          tokens,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Berhasil menambahkan tugas ke Google Calendar");
        return data.event;
      } else {
        throw new Error(data.error || "Failed to export task");
      }
    } catch (error: any) {
      console.error("Error exporting task:", error);
      toast.error("Gagal menambahkan tugas ke Google Calendar");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isConnected,
    isLoading,
    autoSync,
    connect,
    disconnect,
    toggleAutoSync,
    exportSchedule,
    exportSubject,
    exportTasks,
    exportTask,
  };
}
