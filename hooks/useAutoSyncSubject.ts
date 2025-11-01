import { useEffect } from "react";
import { useGoogleCalendar } from "./useGoogleCalendar";
import type { Subject } from "./useSubjects";

/**
 * Hook untuk auto-sync subject ke Google Calendar
 * Mendengarkan perubahan subject dan otomatis ekspor jika auto-sync aktif
 */
export function useAutoSyncSubject() {
  const { isConnected, autoSync, exportSubject } = useGoogleCalendar();

  const syncSubjectToCalendar = async (subject: Subject) => {
    // Only sync if connected and auto-sync is enabled
    if (!isConnected || !autoSync) {
      return;
    }

    try {
      // Determine the date to use for export
      let dateToUse: string | undefined;

      if (subject.specificDate) {
        // Use specific date if available (e.g., for exams)
        dateToUse = subject.specificDate;
      } else if (subject.meetingDates && subject.meetingDates.length > 0) {
        // Use first meeting date if available
        dateToUse = subject.meetingDates[0];
      }

      await exportSubject(subject, dateToUse);
    } catch (error) {
      console.error("Auto-sync failed:", error);
      // Silent fail - don't show error toast to avoid annoying user
    }
  };

  return {
    syncSubjectToCalendar,
    isAutoSyncEnabled: isConnected && autoSync,
  };
}
