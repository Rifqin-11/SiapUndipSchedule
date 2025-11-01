"use client";

import React, { useEffect } from "react";
import { Calendar, Download, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
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
  const { isConnected, isLoading, connect, disconnect, exportSchedule } =
    useGoogleCalendar();

  const [isExportDialogOpen, setIsExportDialogOpen] = React.useState(false);
  const [numberOfWeeks, setNumberOfWeeks] = React.useState(14);

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

    const result = await exportSchedule(subjects, numberOfWeeks);
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
              Jadwal kuliah akan ditambahkan sebagai event berulang di Google
              Calendar Anda.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="weeks">
                Jumlah minggu:{" "}
                <span className="font-bold">{numberOfWeeks}</span>
              </Label>
              <Slider
                id="weeks"
                min={1}
                max={20}
                step={1}
                value={[numberOfWeeks]}
                onValueChange={(value) => setNumberOfWeeks(value[0])}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Event akan dibuat untuk {numberOfWeeks} minggu ke depan
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm">
                <strong>{subjects.length}</strong> mata kuliah akan diekspor
              </p>
              <p className="text-xs text-muted-foreground">
                Setiap mata kuliah akan menjadi event berulang mingguan dengan
                pengingat otomatis.
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
    </>
  );
}
