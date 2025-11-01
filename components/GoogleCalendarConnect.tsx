"use client";

import React, { useEffect } from "react";
import { Calendar, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGoogleCalendar } from "@/hooks/useGoogleCalendar";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Komponen minimalis untuk koneksi Google Calendar di halaman User
 * Hanya menampilkan button Connect/Disconnect
 */
export default function GoogleCalendarConnect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isConnected, isLoading, connect, disconnect, toggleAutoSync } =
    useGoogleCalendar();

  // Handle OAuth callback
  useEffect(() => {
    const calendarConnected = searchParams.get("calendar_connected");
    const tokens = searchParams.get("tokens");
    const error = searchParams.get("calendar_error");

    if (calendarConnected === "true" && tokens) {
      try {
        const decodedTokens = JSON.parse(decodeURIComponent(tokens));
        localStorage.setItem(
          "google_calendar_tokens",
          JSON.stringify(decodedTokens)
        );

        // Enable auto-sync by default when connecting
        localStorage.setItem("google_calendar_auto_sync", "true");

        toast.success("✅ Berhasil terhubung dengan Google Calendar!");
        toast.info(
          "Auto-sync diaktifkan. Jadwal akan otomatis tersinkronisasi.",
          {
            duration: 4000,
          }
        );

        // Clean URL
        router.replace("/user");

        // Reload to update connection status
        window.location.reload();
      } catch (error) {
        console.error("Error saving tokens:", error);
        toast.error("Gagal menyimpan kredensial Google Calendar");
      }
    }

    if (error) {
      let errorMessage = "Gagal menghubungkan ke Google Calendar";
      if (error === "access_denied") {
        errorMessage = "Anda menolak akses ke Google Calendar";
      } else if (error === "token_exchange_failed") {
        errorMessage = "Gagal menukar kode autentikasi";
      }
      toast.error(errorMessage);
      router.replace("/user");
    }
  }, [searchParams, router]);

  const handleConnect = () => {
    connect();
  };

  const handleDisconnect = () => {
    if (
      confirm(
        "Apakah Anda yakin ingin memutuskan koneksi dengan Google Calendar? Auto-sync akan dinonaktifkan."
      )
    ) {
      disconnect();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between gap-3">
        {/* Icon and Text */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
              Google Calendar
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              {isConnected ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    Auto-sync aktif
                  </span>
                </>
              ) : (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Tidak terhubung
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex-shrink-0">
          {isConnected ? (
            <Button
              onClick={handleDisconnect}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Disconnect"
              )}
            </Button>
          ) : (
            <Button
              onClick={handleConnect}
              size="sm"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Connect"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
