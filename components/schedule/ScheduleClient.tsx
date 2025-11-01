"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  getCurrentDayAndDate,
  colorPairs,
  normalizeDayName,
  formatLocalDate,
} from "@/utils/date";
const HorizonalCalendar = dynamic(
  () => import("@/components/schedule/HorizonalCalendar"),
  { ssr: false, loading: () => <div /> }
);

const CalendarCard = dynamic(
  () => import("@/components/schedule/CalendarCard"),
  { ssr: false, loading: () => <div /> }
);

const SubjectModal = dynamic(() => import("@/components/SubjectModal"), {
  ssr: false,
  loading: () => <div />,
});

const RescheduleModal = dynamic(
  () => import("@/components/reschedule/RescheduleModal"),
  { ssr: false, loading: () => <div /> }
);

const GoogleCalendarIntegration = dynamic(
  () => import("@/components/schedule/GoogleCalendarIntegration"),
  { ssr: false, loading: () => <div /> }
);

import Link from "next/link";
import {
  useSubjects,
  useCreateSubject,
  useUpdateSubject,
  useDeleteSubject,
  Subject,
} from "@/hooks/useSubjects";
import { useAutoSyncSubject } from "@/hooks/useAutoSyncSubject";
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
const QRScanner = dynamic(() => import("../QRScanner"), {
  ssr: false,
  loading: () => <div />,
});
import ScheduleSkeleton from "./ScheduleSkeleton";
import useAutoNotifications from "@/hooks/useAutoNotifications";
import PageHeader from "../PageHeader";
import { isClassDay, getMeetingNumberByDate } from "@/utils/meeting-calculator";

interface SubjectWithReschedule extends Subject {
  isReschedule?: boolean;
  rescheduleDate?: string;
  rescheduleInfo?: {
    originalDate: Date;
    newDate: Date;
    reason: string;
    startTime?: string;
    endTime?: string;
    room?: string;
    createdAt: Date;
  };
}

interface SubjectToDelete extends SubjectWithReschedule {
  deleteType?: "subject" | "reschedule";
}

const ScheduleClient = () => {
  const today = new Date();
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const currentDayName = days[today.getDay()];

  const todayString = formatLocalDate(today);

  const [selectedDay, setSelectedDay] = useState(currentDayName);
  const [selectedDate, setSelectedDate] = useState<string>(todayString); // Add selected date state
  const [weekOffset, setWeekOffset] = useState(0); // Add week offset state
  const {
    data: subjects = [],
    isLoading: loading,
    error,
    refetch,
  } = useSubjects();

  // Auto-sync integration
  const { syncSubjectToCalendar } = useAutoSyncSubject();

  const createSubjectMutation = useCreateSubject({
    onAutoSyncSuccess: (subject) => {
      syncSubjectToCalendar(subject);
    },
  });
  const updateSubjectMutation = useUpdateSubject({
    onAutoSyncSuccess: (subject) => {
      syncSubjectToCalendar(subject);
    },
  });
  const deleteSubjectMutation = useDeleteSubject();

  // Initialize auto notifications
  useAutoNotifications();

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  // Delete confirmation dialog states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] =
    useState<SubjectToDelete | null>(null);

  // Reschedule modal states
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [subjectToReschedule, setSubjectToReschedule] =
    useState<Subject | null>(null);
  const [rescheduleOriginalDate, setRescheduleOriginalDate] =
    useState<string>("");

  // Track which subject has active actions (to hide dropdown)
  const [activeActionSubjectId, setActiveActionSubjectId] = useState<
    string | null
  >(null);

  // QR Scanner states
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Set client-side flag and check device compatibility
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize selectedDate to today when component mounts
  useEffect(() => {
    const today = formatLocalDate(new Date());
    setSelectedDate(today);
  }, []);

  // Handle week change from HorizonalCalendar
  const handleWeekChange = (weekOffset: number) => {
    setWeekOffset(weekOffset); // Update week offset state
    // Reset selected date when week changes - use today's date as fallback
    setSelectedDate(todayString);
  };

  // Handle day selection from HorizonalCalendar
  const handleDaySelect = (day: string, date?: string) => {
    setSelectedDay(day);
    if (date) {
      setSelectedDate(date);
    } else {
      // Fallback to calculate date if not provided (backward compatibility)
      const today = new Date();
      const currentDayIndex = today.getDay();
      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const selectedDayIndex = days.indexOf(day);
      const dayDifference = selectedDayIndex - currentDayIndex;
      const calculatedDate = new Date(today);
      calculatedDate.setDate(today.getDate() + dayDifference);
      setSelectedDate(formatLocalDate(calculatedDate));
    }
  };

  // Ensure subjects is always an array
  const subjectsArray = Array.isArray(subjects) ? subjects : [];

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

  // Get reschedule subjects for selected day
  const getSelectedDayDate = () => {
    // Use selectedDate if available, otherwise calculate from selectedDay
    if (selectedDate) {
      return selectedDate;
    }

    // Fallback calculation (for backward compatibility)
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const today = new Date();
    const currentDayIndex = today.getDay();
    const selectedDayIndex = days.indexOf(selectedDay);

    const dayDifference = selectedDayIndex - currentDayIndex;
    const selectedDateCalc = new Date(today);
    selectedDateCalc.setDate(today.getDate() + dayDifference + weekOffset * 7);
    return formatLocalDate(selectedDateCalc); // Use local date format to avoid timezone issues
  };

  const filteredSubjects = subjectsArray.filter((subject) => {
    const selectedDayDate = getSelectedDayDate();

    // Check if subject is date-specific
    if (subject.specificDate) {
      // For date-specific subjects, only show if it matches the selected date
      return subject.specificDate === selectedDayDate;
    }

    // Use meetingDates array if available (new system)
    if (subject.meetingDates && Array.isArray(subject.meetingDates)) {
      return isClassDay(selectedDayDate, subject.meetingDates);
    }

    // For recurring subjects (legacy), check day match and valid schedule
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

  const selectedDayString = getSelectedDayDate();

  console.log("Selected day string (calculated date):", selectedDayString);

  const rescheduleSubjects = subjectsArray
    .filter((subject) => {
      if (!subject.reschedules || subject.reschedules.length === 0)
        return false;

      return subject.reschedules.some((reschedule) => {
        const rescheduleDate = new Date(reschedule.newDate);
        const rescheduleString = formatLocalDate(rescheduleDate);
        return rescheduleString === selectedDayString;
      });
    })
    .map((subject) => {
      // Find the reschedule for selected day
      const dayReschedule = subject.reschedules?.find((reschedule) => {
        const rescheduleDate = new Date(reschedule.newDate);
        const rescheduleString = formatLocalDate(rescheduleDate);
        return rescheduleString === selectedDayString;
      });

      return {
        ...subject,
        isReschedule: true,
        rescheduleDate: selectedDayString,
        rescheduleInfo: dayReschedule,
        name: `${subject.name} (Reschedule)`, // Add indicator in name
        // Use reschedule time and room if available, otherwise use original
        startTime: dayReschedule?.startTime || subject.startTime,
        endTime: dayReschedule?.endTime || subject.endTime,
        room: dayReschedule?.room || subject.room,
      };
    });

  // Helper function to convert time string to minutes for sorting
  const timeToMinutes = (timeStr: string): number => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Combine regular subjects and reschedule subjects
  const allFilteredSubjects: SubjectWithReschedule[] = [
    ...filteredSubjects.map((s) => ({ ...s })),
    ...rescheduleSubjects,
  ];

  // Sort subjects by start time (from morning to evening)
  allFilteredSubjects.sort((a, b) => {
    const timeA = timeToMinutes(a.startTime || "");
    const timeB = timeToMinutes(b.startTime || "");
    return timeA - timeB;
  });

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
    setActiveActionSubjectId(subject.id);
    setSelectedSubject(subject);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleDeleteSubject = async (subject: SubjectWithReschedule) => {
    setActiveActionSubjectId(subject.id);
    // If it's a reschedule subject, we need to delete the reschedule, not the subject
    if (subject.isReschedule) {
      setSubjectToDelete({
        ...subject,
        deleteType: "reschedule",
      });
    } else {
      setSubjectToDelete({
        ...subject,
        deleteType: "subject",
      });
    }
    setIsDeleteDialogOpen(true);
  };

  const handleRescheduleSubject = (subject: Subject) => {
    setActiveActionSubjectId(subject.id);
    setSubjectToReschedule(subject);
    // Set the original date to the currently selected date
    const currentSelectedDate = getSelectedDayDate();
    setRescheduleOriginalDate(currentSelectedDate);
    setIsRescheduleModalOpen(true);
  };

  const confirmDeleteSubject = async () => {
    if (!subjectToDelete) return;

    let result;

    if (subjectToDelete.deleteType === "reschedule") {
      // Delete reschedule entry
      try {
        const response = await fetch(
          `/api/subjects/${subjectToDelete.id}/reschedule`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              rescheduleDate: subjectToDelete.rescheduleDate,
            }),
          }
        );

        const data = await response.json();
        result = data;

        if (result.success) {
          toast.success("Jadwal reschedule berhasil dihapus!");
        } else {
          toast.error(result.error || "Gagal menghapus jadwal reschedule");
        }
      } catch (error) {
        console.error("Error deleting reschedule:", error);
        toast.error("Gagal menghapus jadwal reschedule");
        result = { success: false };
      }
    } else {
      // Delete entire subject (only for selected day)
      try {
        await deleteSubjectMutation.mutateAsync(subjectToDelete.id);
        toast.success(
          `Mata kuliah berhasil dihapus untuk hari ${selectedDay}!`
        );
        result = { success: true };
      } catch (error) {
        toast.error("Gagal menghapus mata kuliah");
        result = { success: false };
      }
    }

    if (result.success) {
      refetch();
    }

    setIsDeleteDialogOpen(false);
    setSubjectToDelete(null);
    setActiveActionSubjectId(null);
  };

  const handleSaveSubject = async (subjectData: Omit<Subject, "_id">) => {
    try {
      if (modalMode === "add") {
        // Ensure subject is added only on the selected day
        const subjectWithSelectedDay = {
          ...subjectData,
          day: selectedDay,
        };
        try {
          await createSubjectMutation.mutateAsync(subjectWithSelectedDay);
          return { success: true };
        } catch (error) {
          return { success: false, error: "Gagal menambah mata kuliah" };
        }
      } else if (modalMode === "edit" && selectedSubject) {
        try {
          await updateSubjectMutation.mutateAsync({
            id: selectedSubject.id,
            subject: subjectData,
          });
          return { success: true };
        } catch (error) {
          return { success: false, error: "Gagal mengupdate mata kuliah" };
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
        <p className="text-xs text-red-500">{error?.message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader variant="calendar" selectedDay={selectedDay} />

      <div className="pt-15 lg:pt-0 mx-5">
        <HorizonalCalendar
          selectedDay={selectedDay}
          onDaySelect={handleDaySelect}
          onWeekChange={handleWeekChange}
        />
      </div>

      <section className="mt-6">
        <div className="mx-5 flex justify-between items-center mb-4">
          <h1 className="font-bold">Academic Schedule</h1>
          <div className="flex gap-2">
            <GoogleCalendarIntegration subjects={subjectsArray} />
            <Button
              onClick={handleAddSubject}
              size="sm"
              className="dark:bg-card hover:bg-gray-800 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-700  dark:text-white shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
        </div>

        {allFilteredSubjects.length > 0 ? (
          allFilteredSubjects.map((subject, index) => {
            // Use a consistent color based on subject ID hash instead of random
            const colorIndex = subject.id
              ? subject.id
                  .split("")
                  .reduce((acc, char) => acc + char.charCodeAt(0), 0) %
                colorPairs.length
              : index % colorPairs.length;
            const assignedColor = colorPairs[colorIndex];

            // Use amber color for reschedule subjects
            const finalColor = subject.isReschedule
              ? {
                  bg: "bg-amber-100 dark:bg-amber-500/10",
                  text: "text-amber-800 dark:text-amber-200",
                  roomBg: "bg-amber-200 dark:bg-amber-800",
                }
              : assignedColor;

            console.log(
              `Subject: ${subject.name}, ID: ${subject.id}, Index: ${index}, IsReschedule: ${subject.isReschedule}`
            );

            return (
              <Link
                href={`/subject-detail/${subject.id}`}
                key={`${subject.id}-${
                  subject.isReschedule ? "reschedule" : "regular"
                }`}
              >
                <CalendarCard
                  {...subject}
                  bgColor={finalColor.bg}
                  textColor={finalColor.text}
                  bgRoomColor={finalColor.roomBg}
                  selectedDate={getSelectedDayDate()}
                  showActions={activeActionSubjectId !== subject.id}
                  onEdit={() => handleEditSubject(subject)}
                  onDelete={() => handleDeleteSubject(subject)}
                  onReschedule={() => handleRescheduleSubject(subject)}
                  isReschedule={subject.isReschedule}
                  rescheduleInfo={subject.rescheduleInfo}
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
        onClose={() => {
          setIsModalOpen(false);
          setActiveActionSubjectId(null);
        }}
        onSave={handleSaveSubject}
        subject={selectedSubject}
        mode={modalMode}
        preselectedDay={modalMode === "add" ? selectedDay : undefined}
        selectedDate={modalMode === "add" ? getSelectedDayDate() : undefined}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="max-w-xs sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              {subjectToDelete?.deleteType === "reschedule" ? (
                <>
                  Apakah Anda yakin ingin menghapus jadwal reschedule &ldquo;
                  {subjectToDelete?.name}&rdquo; untuk hari {selectedDay}? Mata
                  kuliah akan kembali ke jadwal normalnya.
                </>
              ) : (
                <>
                  Apakah Anda yakin ingin menghapus mata kuliah &ldquo;
                  {subjectToDelete?.name}&rdquo; untuk hari {selectedDay}?
                  Tindakan ini tidak dapat dibatalkan.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setActiveActionSubjectId(null)}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteSubject}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={isRescheduleModalOpen}
        onClose={() => {
          setIsRescheduleModalOpen(false);
          setActiveActionSubjectId(null);
          setRescheduleOriginalDate("");
        }}
        subjectId={subjectToReschedule?.id || ""}
        subjectName={subjectToReschedule?.name || ""}
        originalDate={rescheduleOriginalDate}
        onRescheduleAdded={() => {
          refetch();
          setIsRescheduleModalOpen(false);
          setActiveActionSubjectId(null);
          setRescheduleOriginalDate("");
          toast.success("Jadwal berhasil direscheduled");
        }}
      />

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
