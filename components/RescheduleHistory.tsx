import React, { useState } from "react";
import { Calendar, ArrowRight, Clock, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import EditRescheduleModal from "./EditRescheduleModal";

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

interface RescheduleHistoryProps {
  reschedules: RescheduleItem[];
  subjectId: string;
  onRescheduleUpdated: () => void;
}

const RescheduleHistory: React.FC<RescheduleHistoryProps> = ({
  reschedules,
  subjectId,
  onRescheduleUpdated,
}) => {
  const [editingReschedule, setEditingReschedule] =
    useState<RescheduleItem | null>(null);

  const handleDeleteReschedule = async (newDate: string | Date) => {
    try {
      // Ensure we send a consistent date string format
      const dateToSend =
        typeof newDate === "string" ? newDate : newDate.toISOString();

      const response = await fetch(`/api/subjects/${subjectId}/reschedule`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rescheduleDate: dateToSend,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Reschedule deleted successfully!");
        onRescheduleUpdated();
      } else {
        toast.error(data.error || "Failed to delete reschedule");
      }
    } catch (error) {
      console.error("Error deleting reschedule:", error);
      toast.error("Failed to delete reschedule");
    }
  };

  const handleEditReschedule = (reschedule: RescheduleItem) => {
    setEditingReschedule(reschedule);
  };
  if (!reschedules || reschedules.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">No reschedules recorded</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reschedules.map((reschedule, index) => (
        <div
          key={index}
          className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm font-medium text-amber-900 dark:text-amber-200">
                  <span>
                    {new Date(reschedule.originalDate).toLocaleDateString()}
                  </span>
                  <ArrowRight className="w-3 h-3" />
                  <span>
                    {new Date(reschedule.newDate).toLocaleDateString()}
                  </span>
                </div>

                {/* Time and Room info */}
                {(reschedule.startTime ||
                  reschedule.endTime ||
                  reschedule.room) && (
                  <div className="mt-2 space-y-1">
                    {(reschedule.startTime || reschedule.endTime) && (
                      <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300">
                        <Clock className="w-3 h-3" />
                        <span>
                          {reschedule.startTime && reschedule.endTime
                            ? `${reschedule.startTime} - ${reschedule.endTime}`
                            : reschedule.startTime || reschedule.endTime}
                        </span>
                      </div>
                    )}
                    {reschedule.room && (
                      <div className="text-xs text-amber-700 dark:text-amber-300">
                        📍 {reschedule.room}
                      </div>
                    )}
                  </div>
                )}

                {reschedule.reason && (
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-2">
                    💬 {reschedule.reason}
                  </p>
                )}

                <div className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                  Created: {new Date(reschedule.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 ml-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditReschedule(reschedule)}
                className="h-8 w-8 p-0 border-amber-300 hover:bg-amber-100"
              >
                <Edit className="w-3 h-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteReschedule(reschedule.newDate)}
                className="h-8 w-8 p-0 border-red-300 hover:bg-red-100 text-red-600"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      ))}

      {/* Edit Modal */}
      <EditRescheduleModal
        isOpen={!!editingReschedule}
        onClose={() => setEditingReschedule(null)}
        subjectId={subjectId}
        reschedule={editingReschedule}
        onRescheduleUpdated={onRescheduleUpdated}
      />
    </div>
  );
};

export default RescheduleHistory;
