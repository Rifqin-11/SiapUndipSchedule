import React, { useState, useEffect } from "react";
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

interface EditRescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectId: string;
  reschedule: RescheduleItem | null;
  onRescheduleUpdated: () => void;
}

const EditRescheduleModal: React.FC<EditRescheduleModalProps> = ({
  isOpen,
  onClose,
  subjectId,
  reschedule,
  onRescheduleUpdated,
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

  // Update form data when reschedule prop changes
  useEffect(() => {
    if (reschedule) {
      setFormData({
        originalDate: reschedule.originalDate,
        newDate: reschedule.newDate,
        reason: reschedule.reason || "",
        startTime: reschedule.startTime || "",
        endTime: reschedule.endTime || "",
        room: reschedule.room || "",
      });
    }
  }, [reschedule]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.originalDate || !formData.newDate) {
      toast.error("Please fill in both original date and new date");
      return;
    }

    setIsLoading(true);

    try {
      // First delete the old reschedule
      const oldDate = reschedule?.newDate;
      const dateToSend = oldDate
        ? typeof oldDate === "string"
          ? oldDate
          : new Date(oldDate).toISOString()
        : "";

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

      // Then create the new reschedule
      const createResponse = await fetch(
        `/api/subjects/${subjectId}/reschedule`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await createResponse.json();

      if (result.success) {
        toast.success("Reschedule updated successfully!");
        onRescheduleUpdated();
        onClose();
        setFormData({
          originalDate: "",
          newDate: "",
          reason: "",
          startTime: "",
          endTime: "",
          room: "",
        });
      } else {
        toast.error(result.error || "Failed to update reschedule");
      }
    } catch (error) {
      console.error("Error updating reschedule:", error);
      toast.error("Failed to update reschedule. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Edit Class Reschedule
            </DialogTitle>
            <DialogDescription>
              Update the reschedule details for this class.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="originalDate" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Original Date
              </Label>
              <Input
                id="originalDate"
                type="date"
                value={formData.originalDate}
                onChange={(e) =>
                  handleInputChange("originalDate", e.target.value)
                }
                className="w-full bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                disabled
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Original date cannot be changed when editing
              </p>
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
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Reschedule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditRescheduleModal;
