"use client";

import React, { useState, useEffect } from "react";
import {
  getCurrentDayAndDate,
  colorPairs,
  normalizeDayName,
} from "@/utils/date";
import HorizonalCalendar from "@/components/HorizonalCalendar";
import CalendarCard from "@/components/CalendarCard";
import SubjectModal from "@/components/SubjectModal";
import Link from "next/link";
import { useSubjects, Subject } from "@/hooks/useSubjects";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import QRScanner from "./QRScanner";
import ScheduleSkeleton from "./ScheduleSkeleton";
import useAutoNotifications from "@/hooks/useAutoNotifications";

const ScheduleClient = () => {
  const { currentDay } = getCurrentDayAndDate();
  const [selectedDay, setSelectedDay] = useState(currentDay);
  const {
    subjects,
    loading,
    error,
    refetch,
    createSubject,
    updateSubject,
    deleteSubject,
  } = useSubjects();

  // Initialize auto notifications
  useAutoNotifications();

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  // Delete confirmation dialog states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);

  // QR Scanner states
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Set client-side flag and check device compatibility
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Ensure subjects is always an array
  const subjectsArray = Array.isArray(subjects) ? subjects : [];

  // Debug logging
  console.log("ScheduleClient Debug:");
  console.log("Selected day:", selectedDay);
  console.log("Current day from utils:", currentDay);
  console.log("All subjects:", subjectsArray);
  console.log("Subjects count:", subjectsArray.length);

  // Check unique days in database
  const uniqueDays = [
    ...new Set(
      subjectsArray
        .map((s) => s.day)
        .filter((day) => day !== null && day !== undefined)
    ),
  ];
  console.log("Unique days in database:", uniqueDays);

  // Check for subjects with invalid days
  const invalidDaySubjects = subjectsArray.filter(
    (s) => !s.day || typeof s.day !== "string"
  );
  if (invalidDaySubjects.length > 0) {
    console.warn(
      "Found subjects with invalid day property:",
      invalidDaySubjects
    );
  }

  // Helper function to check if a subject has a valid schedule
  const hasValidSchedule = (subject: Subject) => {
    return (
      subject.day &&
      typeof subject.day === "string" &&
      subject.day.trim() !== "" &&
      subject.startTime &&
      typeof subject.startTime === "string" &&
      subject.startTime.trim() !== "" &&
      subject.endTime &&
      typeof subject.endTime === "string" &&
      subject.endTime.trim() !== ""
    );
  };

  const filteredSubjects = subjectsArray.filter((subject) => {
    // Only show subjects that have a valid schedule (day and time)
    if (!hasValidSchedule(subject)) {
      console.log(
        `Skipping subject without valid schedule: ${subject.name} - Day: ${subject.day}, StartTime: ${subject.startTime}, EndTime: ${subject.endTime}`
      );
      return false;
    }

    const normalizedSubjectDay = normalizeDayName(subject.day);
    const normalizedSelectedDay = normalizeDayName(selectedDay);
    console.log(
      `Comparing normalized subject day "${normalizedSubjectDay}" with selected day "${normalizedSelectedDay}"`
    );
    console.log(
      `Original subject day: "${subject.day}", selected day: "${selectedDay}"`
    );
    return normalizedSubjectDay === normalizedSelectedDay;
  });

  console.log("Filtered subjects for today:", filteredSubjects);
  console.log("Today subjects count:", filteredSubjects.length);

  const handleAddSubject = () => {
    setSelectedSubject(null);
    setModalMode("add");
    setIsModalOpen(true);
  };

  const handleQRScanSuccess = (code: string) => {
    console.log("QR Code scanned in schedule:", code);
    // Additional handling if needed
  };

  const handleEditSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleDeleteSubject = async (subject: Subject) => {
    setSubjectToDelete(subject);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteSubject = async () => {
    if (!subjectToDelete) return;

    const result = await deleteSubject(subjectToDelete.id);
    if (result.success) {
      toast.success("Mata kuliah berhasil dihapus!");
      refetch();
    } else {
      toast.error(result.error || "Gagal menghapus mata kuliah");
    }

    setIsDeleteDialogOpen(false);
    setSubjectToDelete(null);
  };

  const handleSaveSubject = async (subjectData: Omit<Subject, "_id">) => {
    try {
      if (modalMode === "add") {
        // Ensure subject is added only on the selected day
        const subjectWithSelectedDay = {
          ...subjectData,
          day: selectedDay,
        };
        const result = await createSubject(subjectWithSelectedDay);
        if (result.success) {
          refetch();
          return { success: true };
        } else {
          return { success: false, error: result.error };
        }
      } else if (modalMode === "edit" && selectedSubject) {
        const result = await updateSubject(selectedSubject.id, subjectData);
        if (result.success) {
          refetch();
          return { success: true };
        } else {
          return { success: false, error: result.error };
        }
      }
      return { success: false, error: "Mode tidak valid" };
    } catch {
      return { success: false, error: "Terjadi kesalahan tak terduga" };
    }
  };

  if (loading) {
    return <ScheduleSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center mt-10">
        <h1 className="font-bold text-lg text-red-600">Error</h1>
        <p className="text-xs text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mx-5">
        <HorizonalCalendar
          selectedDay={selectedDay}
          onDaySelect={setSelectedDay}
        />
      </div>

      <section className="mt-6">
        <div className="mx-5 flex justify-between items-center mb-4">
          <h1 className="font-bold">Academic Schedule</h1>
          <div className="flex gap-2">
            <Button onClick={handleAddSubject} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
        </div>

        {filteredSubjects.length > 0 ? (
          filteredSubjects.map((subject, index) => {
            // Use a consistent color based on subject ID hash instead of random
            const colorIndex = subject.id
              ? subject.id
                  .split("")
                  .reduce((acc, char) => acc + char.charCodeAt(0), 0) %
                colorPairs.length
              : index % colorPairs.length;
            const assignedColor = colorPairs[colorIndex];

            console.log(
              `Subject: ${subject.name}, ID: ${subject.id}, Index: ${index}`
            );

            return (
              <Link href={`/subject-detail/${subject.id}`} key={subject.id}>
                <CalendarCard
                  {...subject}
                  bgColor={assignedColor.bg}
                  textColor={assignedColor.text}
                  bgRoomColor={assignedColor.roomBg}
                  showActions={true}
                  onEdit={() => handleEditSubject(subject)}
                  onDelete={() => handleDeleteSubject(subject)}
                />
              </Link>
            );
          })
        ) : (
          <div className="flex flex-col justify-center items-center mt-10">
            <h1 className="font-bold text-lg text-gray-700 dark:text-gray-300">
              No Schedule
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              You have no class on this day
            </p>
          </div>
        )}
      </section>

      {/* Subject Modal */}
      <SubjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSubject}
        subject={selectedSubject}
        mode={modalMode}
        preselectedDay={modalMode === "add" ? selectedDay : undefined}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus mata kuliah &ldquo;
              {subjectToDelete?.name}&rdquo;? Tindakan ini tidak dapat
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteSubject}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* QR Scanner - Only render on client and if supported */}
      {isClient && (
        <QRScanner
          isOpen={isQRScannerOpen}
          onClose={() => setIsQRScannerOpen(false)}
          onScanSuccess={handleQRScanSuccess}
        />
      )}
    </div>
  );
};

export default ScheduleClient;
