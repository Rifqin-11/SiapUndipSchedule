"use client";

import React, { useEffect } from "react";
import { Calendar, Download, LogOut, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGoogleCalendar } from "@/hooks/useGoogleCalendar";
import { Subject } from "@/hooks/useSubjects";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

interface GoogleCalendarIntegrationProps {
  subjects: Subject[];
}

export default function GoogleCalendarIntegration({
  subjects,
}: GoogleCalendarIntegrationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    isConnected,
    isLoading,
    autoSync,
    connect,
    disconnect,
    toggleAutoSync,
    exportSchedule,
  } = useGoogleCalendar();

  const [isExportDialogOpen, setIsExportDialogOpen] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

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
        toast.success("Berhasil terhubung dengan Google Calendar!");

        // Clean URL
        router.replace("/schedule");

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
      router.replace("/schedule");
    }
  }, [searchParams, router]);

  const handleConnect = () => {
    connect();
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const handleExport = async () => {
    if (subjects.length === 0) {
      toast.error("Tidak ada jadwal untuk diekspor");
      return;
    }

    console.log("[GoogleCalendar] Exporting subjects:", {
      count: subjects.length,
      subjects: subjects.map((s) => ({
        name: s.name,
        day: s.day,
        startTime: s.startTime,
        endTime: s.endTime,
        meetingDatesCount: s.meetingDates?.length || 0,
      })),
    });

    const result = await exportSchedule(subjects);
    if (result) {
      setIsExportDialogOpen(false);
    }
  };

  const handleExportClick = () => {
    if (!isConnected) {
      toast.info("Silakan hubungkan dengan Google Calendar terlebih dahulu");
      handleConnect();
      return;
    }
    setIsExportDialogOpen(true);
  };

  return (
    <>
      {!isConnected ? (
        <Button
          onClick={handleConnect}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Calendar className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">Hubungkan Google Calendar</span>
          <span className="sm:hidden">Calendar</span>
        </Button>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Calendar className="h-4 w-4 text-green-600" />
              )}
              <span className="hidden sm:inline">Google Calendar</span>
              <span className="sm:hidden">Calendar</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={handleExportClick} disabled={isLoading}>
              <Download className="mr-2 h-4 w-4" />
              Ekspor Jadwal ke Calendar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Pengaturan Auto-Sync
              {autoSync && (
                <span className="ml-auto text-xs text-green-600">ON</span>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDisconnect}
              className="text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Putuskan Koneksi
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ekspor Jadwal ke Google Calendar</DialogTitle>
            <DialogDescription>
              Jadwal kuliah akan ditambahkan berdasarkan Learning Progress
              (meetingDates) setiap mata kuliah.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm">
                <strong>{subjects.length}</strong> mata kuliah akan diekspor
              </p>
              <p className="text-xs text-muted-foreground">
                ✅ Setiap mata kuliah akan dibuat event sesuai tanggal pertemuan
                di Learning Progress
              </p>
              <p className="text-xs text-muted-foreground">
                ✅ Jadwal reschedule akan ditambahkan sebagai event terpisah
              </p>
              <p className="text-xs text-muted-foreground">
                ✅ Jadwal UTS/UAS akan ditambahkan dengan warna merah
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsExportDialogOpen(false)}
            >
              Batal
            </Button>
            <Button onClick={handleExport} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengekspor...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Ekspor Sekarang
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Auto-Sync Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pengaturan Auto-Sync Google Calendar</DialogTitle>
            <DialogDescription>
              Atur sinkronisasi otomatis dengan Google Calendar
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex-1 space-y-1">
                <Label htmlFor="auto-sync" className="text-sm font-medium">
                  Auto-Sync ke Google Calendar
                </Label>
                <p className="text-xs text-muted-foreground">
                  Otomatis ekspor jadwal baru ke Google Calendar saat Anda
                  menambahkan jadwal
                </p>
              </div>
              <Switch
                id="auto-sync"
                checked={autoSync}
                onCheckedChange={toggleAutoSync}
              />
            </div>

            {autoSync && (
              <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 p-3">
                <p className="text-xs text-green-800 dark:text-green-200">
                  ✅ Auto-sync aktif. Jadwal baru akan otomatis ditambahkan ke
                  Google Calendar.
                </p>
              </div>
            )}

            {!autoSync && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 dark:bg-gray-900/20 dark:border-gray-800 p-3">
                <p className="text-xs text-muted-foreground">
                  ℹ️ Anda perlu ekspor manual untuk menambahkan jadwal ke Google
                  Calendar.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsSettingsOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
