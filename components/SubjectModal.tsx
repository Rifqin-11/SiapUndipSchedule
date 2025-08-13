"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Subject } from "@/hooks/useSubjects";
import { toast } from "sonner";

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    subject: Omit<Subject, "_id">
  ) => Promise<{ success: boolean; error?: string }>;
  subject?: Subject | null;
  mode: "add" | "edit";
  preselectedDay?: string; // Hari yang sudah dipilih dari ScheduleClient
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
}) => {
  const [formData, setFormData] = useState({
    name: "",
    day: "",
    room: "",
    startTime: "",
    endTime: "",
    lecturer: [""],
    meeting: 1,
    category: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when modal opens/closes or subject changes
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && subject) {
        setFormData({
          name: subject.name || "",
          day: subject.day || "",
          room: subject.room || "",
          startTime: subject.startTime || "",
          endTime: subject.endTime || "",
          lecturer: Array.isArray(subject.lecturer) ? subject.lecturer : [""],
          meeting: subject.meeting || 1,
          category: subject.category || "",
        });
      } else {
        // Reset for add mode dengan hari yang sudah dipilih
        setFormData({
          name: "",
          day: preselectedDay || "",
          room: "",
          startTime: "",
          endTime: "",
          lecturer: [""],
          meeting: 1,
          category: "",
        });
      }
    }
  }, [isOpen, mode, subject, preselectedDay]);

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
    const hasDay = formData.day && formData.day.trim() !== "";
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
      const subjectData = {
        ...formData,
        lecturer: filteredLecturers,
        id: mode === "edit" && subject ? subject.id : `${Date.now()}`, // Temporary ID for new subjects
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
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
            <Label htmlFor="day">
              Day (Optional - Leave blank for subjects without schedule)
            </Label>
            <Select
              value={formData.day}
              onValueChange={(value) => handleInputChange("day", value)}
              disabled={mode === "add" && !!preselectedDay}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select day (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No Schedule</SelectItem>
                {days.map((day) => (
                  <SelectItem key={day} value={day}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {mode === "add" && preselectedDay && (
              <p className="text-xs text-gray-500">
                Subject will be added on {preselectedDay}
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="meeting">Meeting Count</Label>
              <Input
                id="meeting"
                type="number"
                min="1"
                max="20"
                value={formData.meeting}
                onChange={(e) =>
                  handleInputChange("meeting", parseInt(e.target.value) || 1)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
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
