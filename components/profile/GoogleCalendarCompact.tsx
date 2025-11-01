"use client";

import { useState } from "react";
import { Calendar, Loader2, Download, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { useGoogleCalendar } from "@/hooks/useGoogleCalendar";
import { useSubjects } from "@/hooks/useSubjects";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const GoogleCalendarCompact = () => {
  const { data: subjects } = useSubjects();
  const {
    isConnected,
    isLoading,
    autoSync,
    connect,
    disconnect,
    exportSchedule,
    toggleAutoSync,
    deleteAllEvents,
  } = useGoogleCalendar();

  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAutoSyncDialog, setShowAutoSyncDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const activeSubjects = subjects?.filter((s) => !s.examType) || [];

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error("Connection error:", error);
    }
  };

  const handleExport = async () => {
    if (!subjects || subjects.length === 0) {
      toast.error("No subjects to export");
      return;
    }

    setIsExporting(true);
    try {
      await exportSchedule(subjects);
      toast.success("Schedule exported successfully!");
      setShowExportDialog(false);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export schedule");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteAllEvents();
      toast.success("All events deleted successfully!");
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete events");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleAutoSync = () => {
    const newAutoSyncState = !autoSync;
    toggleAutoSync(newAutoSyncState);
    setShowAutoSyncDialog(false);
  };

  if (!isConnected) {
    return (
      <button
        onClick={handleConnect}
        disabled={isLoading}
        className="w-full p-3 bg-white dark:bg-card rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Google Calendar
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Connect to sync your schedule
            </p>
          </div>
        </div>
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        ) : (
          <div className="text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        )}
      </button>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {/* Connected Status */}
        <div className="w-full p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                Google Calendar Connected
              </span>
            </div>
            {autoSync && (
              <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">
                Auto-sync ON
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2">
          {/* Export Button */}
          <button
            onClick={() => setShowExportDialog(true)}
            disabled={isLoading || activeSubjects.length === 0}
            className="p-3 bg-white dark:bg-card rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-1"
          >
            <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Export
            </span>
          </button>

          {/* Auto-sync Button */}
          <button
            onClick={() => setShowAutoSyncDialog(true)}
            disabled={isLoading}
            className="p-3 bg-white dark:bg-card rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-1"
          >
            {autoSync ? (
              <ToggleRight className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            ) : (
              <ToggleLeft className="w-4 h-4 text-gray-400" />
            )}
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Auto-sync
            </span>
          </button>

          {/* Delete Button */}
          <button
            onClick={() => setShowDeleteDialog(true)}
            disabled={isLoading}
            className="p-3 bg-white dark:bg-card rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-1"
          >
            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Delete
            </span>
          </button>
        </div>

        {/* Disconnect Button */}
        <button
          onClick={disconnect}
          disabled={isLoading}
          className="w-full p-2 text-xs text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Disconnect Google Calendar
        </button>
      </div>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export to Google Calendar</DialogTitle>
            <DialogDescription>
              This will export {activeSubjects.length} subject(s) to your Google Calendar.
              Each subject will create individual events based on meeting dates.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowExportDialog(false)}
              disabled={isExporting}
            >
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Exporting...
                </>
              ) : (
                "Export Now"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete All Events</DialogTitle>
            <DialogDescription>
              This will permanently delete ALL events from your Google Calendar
              created by this app. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete All"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Auto-sync Dialog */}
      <Dialog open={showAutoSyncDialog} onOpenChange={setShowAutoSyncDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Auto-sync Settings</DialogTitle>
            <DialogDescription>
              {autoSync
                ? "Auto-sync is currently enabled. New or updated subjects will automatically sync to Google Calendar."
                : "Enable auto-sync to automatically export new or updated subjects to Google Calendar."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAutoSyncDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleToggleAutoSync}>
              {autoSync ? "Disable Auto-sync" : "Enable Auto-sync"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GoogleCalendarCompact;
