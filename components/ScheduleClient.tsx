"use client";

import React, { useState } from "react";
import { getCurrentDayAndDate, colorPairs } from "@/utils/date";
import HorizonalCalendar from "@/components/HorizonalCalendar";
import CalendarCard from "@/components/CalendarCard";
import SubjectModal from "@/components/SubjectModal";
import Link from "next/link";
import { useSubjects, Subject } from "@/hooks/useSubjects";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

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

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  // Ensure subjects is always an array
  const subjectsArray = Array.isArray(subjects) ? subjects : [];

  const filteredSubjects = subjectsArray.filter(
    (subject) => subject.day === selectedDay
  );

  const handleAddSubject = () => {
    setSelectedSubject(null);
    setModalMode("add");
    setIsModalOpen(true);
  };

  const handleEditSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleDeleteSubject = async (subject: Subject) => {
    if (
      window.confirm(
        `Apakah Anda yakin ingin menghapus mata kuliah "${subject.name}"?`
      )
    ) {
      const result = await deleteSubject(subject.id);
      if (result.success) {
        toast.success("Mata kuliah berhasil dihapus!");
        refetch();
      } else {
        toast.error(result.error || "Gagal menghapus mata kuliah");
      }
    }
  };

  const handleSaveSubject = async (subjectData: Omit<Subject, "_id">) => {
    try {
      if (modalMode === "add") {
        // Pastikan mata kuliah ditambahkan hanya pada hari yang dipilih
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
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
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
        <div className="mx-5 flex justify-between items-center">
          <h1 className="font-bold">Academic Schedule</h1>
          <Button onClick={handleAddSubject} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Tambah
          </Button>
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
    </div>
  );
};

export default ScheduleClient;
