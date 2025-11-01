import { useEffect, useState } from "react";
import type { Subject } from "./useSubjects";

interface GoogleCalendarTokens {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
}

/**
 * Hook untuk auto-sync subject ke Google Calendar
 * Mendengarkan perubahan subject dan otomatis ekspor jika auto-sync aktif
 */
export function useAutoSyncSubject() {
  const [isConnected, setIsConnected] = useState(false);
  const [tokens, setTokens] = useState<GoogleCalendarTokens | null>(null);
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(false);

  // Check connection status and auto-sync preference
  useEffect(() => {
    const savedTokens = localStorage.getItem("google_calendar_tokens");
    if (savedTokens) {
      try {
        const parsedTokens = JSON.parse(savedTokens);
        setTokens(parsedTokens);
        setIsConnected(true);
      } catch (error) {
        console.error("Error parsing saved tokens:", error);
      }
    }

    const autoSyncPref = localStorage.getItem("google_calendar_auto_sync");
    setIsAutoSyncEnabled(autoSyncPref === "true");
  }, []);

  const syncSubjectToCalendar = async (subject: Subject) => {
    // Only sync if connected and auto-sync is enabled
    if (!isConnected || !tokens || !isAutoSyncEnabled) {
      return;
    }

    try {
      console.log("🔄 Auto-syncing subject to Google Calendar:", subject.name);

      const response = await fetch("/api/google-calendar/export-subject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject,
          tokens,
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log(
          "✅ Subject auto-synced to Google Calendar:",
          subject.name
        );
      } else {
        console.error("Failed to auto-sync subject:", data.error);
      }
    } catch (error) {
      console.error("Error auto-syncing subject to Google Calendar:", error);
      // Silent fail - don't show error toast to avoid annoying user
    }
  };

  return {
    syncSubjectToCalendar,
    isAutoSyncEnabled: isConnected && isAutoSyncEnabled,
  };
}
