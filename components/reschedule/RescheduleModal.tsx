"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Clock } from "lucide-react";
import { toast } from "sonner";
import { forceModalCleanup, useModalCleanup } from "@/lib/modal-utils";
import { useAutoSyncSubject } from "@/hooks/useAutoSyncSubject";
import { Subject } from "@/hooks/useSubjects";

interface RescheduleItem {
  subjectId: string;
  originalDate: string;
  newDate: string;
  reason: string;
  startTime?: string;
  endTime?: string;
  room?: string;
  createdAt: Date;
}

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectId: string;
  subjectName: string;
  originalDate?: string;
  mode?: "create" | "edit";
  existingReschedule?: RescheduleItem | null;
  onRescheduleAdded: () => void;
}

const RescheduleModal: React.FC<RescheduleModalProps> = ({
  isOpen,
  onClose,
  subjectId,
  subjectName,
  originalDate = "",
  mode = "create",
  existingReschedule = null,
  onRescheduleAdded,
}) => {
  const [formData, setFormData] = useState({
    originalDate: "",
    newDate: "",
    reason: "",
    startTime: "",
    endTime: "",
    room: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Auto-sync integration
  const { syncSubjectToCalendar } = useAutoSyncSubject();

  // Auto-cleanup saat modal ditutup & saat komponen unmount
  useModalCleanup(isOpen);

  // Set form data based on mode when modal opens
  React.useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && existingReschedule) {
        // Edit mode: populate with existing reschedule data
        setFormData({
          originalDate: existingReschedule.originalDate,
          newDate: existingReschedule.newDate,
          reason: existingReschedule.reason || "",
          startTime: existingReschedule.startTime || "",
          endTime: existingReschedule.endTime || "",
          room: existingReschedule.room || "",
        });
      } else if (mode === "create" && originalDate) {
        // Create mode: auto-fill originalDate only
        setFormData((prev) => ({ ...prev, originalDate }));
      }
    }
  }, [isOpen, mode, originalDate, existingReschedule]);

  // Reset form when modal is closed
  React.useEffect(() => {
    if (!isOpen) {
      setFormData({
        originalDate: "",
        newDate: "",
        reason: "",
        startTime: "",
        endTime: "",
        room: "",
      });
    }
  }, [isOpen]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const hardClose = () => {
    onClose();
    // Paksa cleanup untuk mengatasi race animasi / scroll-lock yang telat rilis
    forceModalCleanup();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.originalDate || !formData.newDate) {
      toast.error("Please fill in both original date and new date");
      return;
    }

    setIsLoading(true);
    try {
      if (mode === "edit" && existingReschedule) {
        // Edit mode: Delete old reschedule then create new one
        const oldDate = existingReschedule.newDate;
        const dateToSend = oldDate
          ? typeof oldDate === "string"
            ? oldDate
            : new Date(oldDate).toISOString()
          : "";

        // First delete the old reschedule
        const deleteResponse = await fetch(
          `/api/subjects/${subjectId}/reschedule`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              rescheduleDate: dateToSend,
            }),
          }
        );

        if (!deleteResponse.ok) {
          throw new Error("Failed to delete old reschedule");
        }
      }

      // Create new reschedule (for both create and edit modes)
      const response = await fetch(`/api/subjects/${subjectId}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        const successMessage =
          mode === "edit"
            ? "Class reschedule updated successfully!"
            : "Class reschedule recorded successfully!";
        toast.success(successMessage);

        // Auto-sync the updated subject to Google Calendar
        if (result.subject) {
          syncSubjectToCalendar(result.subject as Subject);
        }

        onRescheduleAdded();
        // Tutup + cleanup
        hardClose();
        // Reset form
        setFormData({
          originalDate: "",
          newDate: "",
          reason: "",
          startTime: "",
          endTime: "",
          room: "",
        });
      } else {
        toast.error(result.error || `Failed to ${mode} reschedule`);
      }
    } catch (error) {
      console.error("Error recording reschedule:", error);
      toast.error("Failed to record reschedule. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        // Hanya close saat berubah ke false (dan tidak sedang loading)
        if (!open && !isLoading) {
          hardClose();
        }
      }}
    >
      <DialogContent
        // Tambahkan guard pointer-events-none saat state closed sebagai safety net
        className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto data-[state=closed]:pointer-events-none"
        onPointerDownOutside={(e) => {
          // Cegah close saat sedang submit
          if (isLoading) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (isLoading) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            {mode === "edit" ? "Edit Reschedule" : "Reschedule Class"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit" ? "Update the" : "Record a"} class reschedule for{" "}
            <strong>{subjectName}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="originalDate" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Original Date (Cancelled)
              </Label>
              <Input
                id="originalDate"
                type="date"
                value={formData.originalDate}
                onChange={(e) =>
                  handleInputChange("originalDate", e.target.value)
                }
                className={`w-full ${
                  mode === "create"
                    ? "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                    : ""
                }`}
                disabled={mode === "create"}
                required
              />
              {mode === "create" && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Automatically filled based on selected date
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newDate" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                New Date (Replacement)
              </Label>
              <Input
                id="newDate"
                type="date"
                value={formData.newDate}
                onChange={(e) => handleInputChange("newDate", e.target.value)}
                className="w-full"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Start Time
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    handleInputChange("startTime", e.target.value)
                  }
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  End Time
                </Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange("endTime", e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="room">Room (Optional)</Label>
              <Input
                id="room"
                type="text"
                placeholder="e.g., Room 101, Lab A, etc."
                value={formData.room}
                onChange={(e) => handleInputChange("room", e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Input
                id="reason"
                type="text"
                placeholder="e.g., Lecturer unavailable, Holiday, etc."
                value={formData.reason}
                onChange={(e) => handleInputChange("reason", e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={hardClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Recording..." : "Record Reschedule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RescheduleModal;
