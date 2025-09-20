"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { formatLocalDate } from "@/utils/date";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Subject } from "@/hooks/useSubjects";
import { toast } from "sonner";
import { DialogPortal } from "@radix-ui/react-dialog";
import { forceModalCleanup, useModalCleanup } from "@/lib/modal-utils";
import "./ui/z-index-fixes.css";
import "./ui/toast-mobile.css";

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    subject: Omit<Subject, "_id">
  ) => Promise<{ success: boolean; error?: string }>;
  subject?: Subject | null;
  mode: "add" | "edit";
  preselectedDay?: string; // Hari yang sudah dipilih dari ScheduleClient (legacy)
  selectedDate?: string; // Tanggal spesifik (YYYY-MM-DD format)
  showMeetingCount?: boolean; // Flag untuk menampilkan meeting count (hanya di manage-subject)
}

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const SubjectModal: React.FC<SubjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  subject,
  mode,
  preselectedDay,
  selectedDate,
  showMeetingCount = false,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    day: "no-schedule", // Default to "no-schedule" instead of empty string
    room: "",
    startTime: "",
    endTime: "",
    lecturer: [""],
    meeting: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [repeatWeekly, setRepeatWeekly] = useState(false); // State for repeat checkbox

  // Use modal cleanup hook
  useModalCleanup(isOpen);

  // Reset form when modal opens/closes or subject changes
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && subject) {
        setFormData({
          name: subject.name || "",
          day: subject.day || "no-schedule", // Use "no-schedule" if empty
          room: subject.room || "",
          startTime: subject.startTime || "",
          endTime: subject.endTime || "",
          lecturer: Array.isArray(subject.lecturer) ? subject.lecturer : [""],
          meeting: Number(subject.meeting) || 0,
        });
        // For edit mode, set repeat based on whether subject is recurring or date-specific
        setRepeatWeekly(!subject.specificDate); // If no specificDate, it's recurring
      } else {
        // Reset for add mode
        const initialDay = preselectedDay || "no-schedule";
        setFormData({
          name: "",
          day: initialDay,
          room: "",
          startTime: "",
          endTime: "",
          lecturer: [""],
          meeting: 0,
        });
        // For add mode, default repeat weekly to true if a specific day is selected (not no-schedule)
        // If preselectedDay is provided (from schedule page), default to true since user selected a specific day
        setRepeatWeekly(initialDay !== "no-schedule");
      }
    } else {
      // Cleanup when modal closes
      setIsLoading(false);
    }
  }, [isOpen, mode, subject, preselectedDay, selectedDate]);

  // Clear schedule-related fields when "no-schedule" is selected
  useEffect(() => {
    if (formData.day === "no-schedule") {
      setFormData((prev) => ({
        ...prev,
        startTime: "",
        endTime: "",
        room: "",
      }));
      // Also disable repeat weekly when no schedule
      setRepeatWeekly(false);
    }
  }, [formData.day]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLecturerChange = (index: number, value: string) => {
    const newLecturers = [...formData.lecturer];
    newLecturers[index] = value;
    setFormData((prev) => ({
      ...prev,
      lecturer: newLecturers,
    }));
  };

  const addLecturer = () => {
    setFormData((prev) => ({
      ...prev,
      lecturer: [...prev.lecturer, ""],
    }));
  };

  const removeLecturer = (index: number) => {
    if (formData.lecturer.length > 1) {
      const newLecturers = formData.lecturer.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        lecturer: newLecturers,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error("Subject name is required");
      return;
    }

    // Validate schedule consistency: if day is set, time must also be set, and vice versa
    const hasDay =
      formData.day &&
      formData.day.trim() !== "" &&
      formData.day !== "no-schedule";
    const hasTime =
      formData.startTime &&
      formData.startTime.trim() !== "" &&
      formData.endTime &&
      formData.endTime.trim() !== "";

    if (hasDay && !hasTime) {
      toast.error("If day is selected, start time and end time are required");
      return;
    }

    if (hasTime && !hasDay) {
      toast.error("If time is set, day must be selected");
      return;
    }

    // Room is only required if schedule is set
    if ((hasDay || hasTime) && !formData.room.trim()) {
      toast.error("Room is required when schedule is set");
      return;
    }

    // Filter out empty lecturers
    const filteredLecturers = formData.lecturer.filter((l) => l.trim() !== "");
    if (filteredLecturers.length === 0) {
      toast.error("At least one lecturer is required");
      return;
    }

    setIsLoading(true);

    try {
      // Auto-generate category based on meeting count
      const getAutoCategory = (meetingCount: number): string => {
        if (meetingCount >= 11) {
          return "Low";
        } else {
          return "High";
        }
      };

      // Get today's date as startDate for weekly repeating subjects
      const todayDate = formatLocalDate(new Date()); // YYYY-MM-DD format

      const subjectData = {
        ...formData,
        lecturer: filteredLecturers,
        day: formData.day === "no-schedule" ? "" : formData.day, // Convert back to empty string
        startDate:
          repeatWeekly && formData.day !== "no-schedule"
            ? todayDate
            : undefined, // Use today's date for weekly repeating subjects
        specificDate:
          mode === "add" && formData.day !== "no-schedule" && !repeatWeekly
            ? selectedDate || todayDate // Use current date if no selectedDate
            : undefined, // Use selectedDate only if not repeating weekly and a day is selected
        category: getAutoCategory(formData.meeting), // Auto-generated category
        id: mode === "edit" && subject ? subject.id : "", // Backend will generate for new subjects
        userId: mode === "edit" && subject ? subject.userId : "", // Backend will set from auth token for new subjects
      };

      const result = await onSave(subjectData);

      if (result.success) {
        toast.success(
          mode === "add"
            ? "Subject successfully added!"
            : "Subject successfully updated!"
        );
        onClose();
      } else {
        toast.error(result.error || "An error occurred");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Error saving subject:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isLoading) {
          // Force cleanup before closing
          forceModalCleanup();
          onClose();
        }
      }}
    >
      <DialogContent
        className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto data-[state=closed]:pointer-events-none"
        onPointerDownOutside={(e) => {
          if (isLoading) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (isLoading) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add Subject" : "Edit Subject"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Enter details for new subject"
              : "Update subject details"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Subject Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Example: Algorithms and Programming"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="day">
                Day {preselectedDay ? "(Auto-selected from calendar)" : ""}
              </Label>
            </div>
            <div className="flex flex-row items-center gap-4">
              <Select
                value={formData.day}
                onValueChange={(value) => handleInputChange("day", value)}
                disabled={!!preselectedDay} // Only disable when preselectedDay is provided (from schedule page)
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select day (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-schedule">No Schedule</SelectItem>
                  {days.map((day) => (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {mode === "add" && formData.day !== "no-schedule" && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="repeat-weekly"
                    checked={repeatWeekly}
                    onCheckedChange={(checked) =>
                      setRepeatWeekly(checked === true)
                    }
                  />
                  <Label
                    htmlFor="repeat-weekly"
                    className="text-sm font-normal"
                  >
                    Repeat Weekly
                  </Label>
                </div>
              )}
            </div>
            {mode === "add" && formData.day !== "no-schedule" && (
              <p className="text-xs text-blue-600 font-medium">
                {repeatWeekly
                  ? `This subject will occur on ${formData.day} and repeat every week for 14 meetings starting from today.`
                  : `This subject will only occur once on ${formData.day} and will not repeat weekly.`}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time (Optional)</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => handleInputChange("startTime", e.target.value)}
                placeholder="Only if scheduled"
                disabled={formData.day === "no-schedule"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time (Optional)</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => handleInputChange("endTime", e.target.value)}
                placeholder="Only if scheduled"
                disabled={formData.day === "no-schedule"}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="room">
              Room (Required only if schedule is set)
            </Label>
            <Input
              id="room"
              value={formData.room}
              onChange={(e) => handleInputChange("room", e.target.value)}
              placeholder="Example: K201 (leave blank if no schedule)"
              disabled={formData.day === "no-schedule"}
            />
          </div>

          <div className="space-y-2">
            <Label>Lecturer *</Label>
            {formData.lecturer.map((lecturer, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={lecturer}
                  onChange={(e) => handleLecturerChange(index, e.target.value)}
                  placeholder={`Lecturer name ${index + 1}`}
                />
                {formData.lecturer.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeLecturer(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addLecturer}
            >
              + Add Lecturer
            </Button>
          </div>

          {/* Meeting Count - Only show in edit mode and when showMeetingCount is true */}
          {mode === "edit" && showMeetingCount && (
            <div className="space-y-2">
              <Label htmlFor="meeting">Meeting Count</Label>
              <Input
                id="meeting"
                type="number"
                min="0"
                max="20"
                value={formData.meeting || 0}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  handleInputChange(
                    "meeting",
                    isNaN(value) ? 0 : Math.max(0, value)
                  );
                }}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                // Force cleanup using utility function
                forceModalCleanup();
                onClose();
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : mode === "add" ? "Add" : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SubjectModal;
