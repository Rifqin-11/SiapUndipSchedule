import { useGoogleCalendar } from "./useGoogleCalendar";
import type { Task } from "@/components/tasks/types";

/**
 * Hook untuk auto-sync task ke Google Calendar
 * Mendengarkan perubahan task dan otomatis ekspor jika auto-sync aktif
 */
export function useAutoSyncTask() {
  const { isConnected, autoSync, exportTask } = useGoogleCalendar();

  const syncTaskToCalendar = async (task: Task) => {
    // Only sync if connected and auto-sync is enabled
    if (!isConnected || !autoSync) {
      return;
    }

    try {
      await exportTask(task);
    } catch (error) {
      console.error("Auto-sync failed:", error);
      // Silent fail - don't show error toast to avoid annoying user
    }
  };

  return {
    syncTaskToCalendar,
    isAutoSyncEnabled: isConnected && autoSync,
  };
}
