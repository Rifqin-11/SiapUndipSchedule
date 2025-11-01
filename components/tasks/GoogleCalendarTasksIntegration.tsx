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
import { useGoogleCalendar } from "@/hooks/useGoogleCalendar";
import { Task } from "@/hooks/useTasks";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

interface GoogleCalendarTasksIntegrationProps {
  tasks: Task[];
}

export default function GoogleCalendarTasksIntegration({
  tasks,
}: GoogleCalendarTasksIntegrationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isConnected, isLoading, connect, disconnect, exportTasks } =
    useGoogleCalendar();

  const [isExportDialogOpen, setIsExportDialogOpen] = React.useState(false);

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
        router.replace("/tasks");
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
      router.replace("/tasks");
    }
  }, [searchParams, router]);

  const handleConnect = () => {
    connect();
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const handleExport = async () => {
    const incompleteTasks = tasks.filter((task) => task.status !== "completed");

    if (incompleteTasks.length === 0) {
      toast.error("Tidak ada tugas yang belum selesai untuk diekspor");
      return;
    }

    const result = await exportTasks(incompleteTasks);
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

  const incompleteTasks = tasks.filter((task) => task.status !== "completed");

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
              Ekspor Tugas ke Calendar
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
            <DialogTitle>Ekspor Tugas ke Google Calendar</DialogTitle>
            <DialogDescription>
              Tugas yang belum selesai akan ditambahkan sebagai event di Google
              Calendar Anda.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm">
                <strong>{incompleteTasks.length}</strong> tugas belum selesai
                akan diekspor
              </p>
              <p className="text-xs text-muted-foreground">
                Setiap tugas akan menjadi event dengan pengingat otomatis
                berdasarkan deadline.
              </p>
            </div>
            {incompleteTasks.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Tidak ada tugas yang belum selesai untuk diekspor.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsExportDialogOpen(false)}
            >
              Batal
            </Button>
            <Button
              onClick={handleExport}
              disabled={isLoading || incompleteTasks.length === 0}
            >
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
