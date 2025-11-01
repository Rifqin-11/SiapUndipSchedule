"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import {
  useSubjects,
  useCreateSubject,
  useUpdateSubject,
  useDeleteSubject,
  useDeleteAllSubjects,
  Subject,
} from "@/hooks/useSubjects";
import { useAutoSyncSubject } from "@/hooks/useAutoSyncSubject";
import SubjectModal from "@/components/SubjectModal";
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
import { Plus, Edit, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

// Lazy load Google Calendar integration
const GoogleCalendarIntegration = dynamic(
  () => import("@/components/schedule/GoogleCalendarIntegration"),
  { ssr: false, loading: () => <div /> }
);

const ManageSubjects = () => {
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
  const deleteAllSubjectsMutation = useDeleteAllSubjects();

  // Ensure subjects is always an array
  const safeSubjects = Array.isArray(subjects) ? subjects : [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Delete confirmation dialog states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);

  // Delete all confirmation dialog states
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);

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

  const handleAddSubject = () => {
    setEditingSubject(null);
    setModalMode("add");
    setIsModalOpen(true);
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleSaveSubject = async (subjectData: Omit<Subject, "_id">) => {
    try {
      if (modalMode === "add") {
        await createSubjectMutation.mutateAsync(subjectData);
        toast.success("Subject successfully added!");
        setIsModalOpen(false);
        return { success: true };
      } else if (modalMode === "edit" && editingSubject) {
        await updateSubjectMutation.mutateAsync({
          id: editingSubject.id,
          subject: subjectData,
        });
        toast.success("Subject successfully updated!");
        setIsModalOpen(false);
        return { success: true };
      }
      return { success: false, error: "Invalid mode" };
    } catch {
      return { success: false, error: "Terjadi kesalahan tak terduga" };
    }
  };

  const handleDeleteSubject = async (subject: Subject) => {
    setSubjectToDelete(subject);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteSubject = async () => {
    if (!subjectToDelete) return;

    try {
      await deleteSubjectMutation.mutateAsync(subjectToDelete.id);
      toast.success("Mata kuliah berhasil dihapus!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal menghapus mata kuliah";
      toast.error(`Error: ${errorMessage}`);
    }

    setIsDeleteDialogOpen(false);
    setSubjectToDelete(null);
  };

  const handleDeleteAllSubjects = () => {
    setIsDeleteAllDialogOpen(true);
  };

  const confirmDeleteAllSubjects = async () => {
    try {
      const result = await deleteAllSubjectsMutation.mutateAsync();
      toast.success(
        `Berhasil menghapus semua mata kuliah! (${
          result.deletedCount || 0
        } mata kuliah dihapus)`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Gagal menghapus semua mata kuliah";
      toast.error(`Error: ${errorMessage}`);
    }

    setIsDeleteAllDialogOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSubject(null);
    setModalMode("add"); // Reset mode
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
        <p className="text-red-500">{error?.message}</p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="max-full mx-auto p-6">
        {/* Upload Links Section */}
        <div className="space-y-3 mb-6">
          <Link
            href="/settings/upload-krs"
            className="block p-4 bg-white dark:bg-card rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl bg-indigo-50 dark:bg-secondary`}>
                <Upload
                  className={`w-5 h-5 text-indigo-600 dark:text-gray-300`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Upload IRS
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Upload your IRS document securely
                </p>
              </div>
              <div className="text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
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
            </div>
          </Link>

          <Link
            href="/settings/upload-exam-card"
            className="block p-4 bg-white dark:bg-card rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl bg-orange-50 dark:bg-secondary`}>
                <Upload
                  className={`w-5 h-5 text-orange-600 dark:text-gray-300`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  Upload Kartu UTS/UAS
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Upload exam schedule and shift regular classes
                </p>
              </div>
              <div className="text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
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
            </div>
          </Link>
        </div>
        <div className="flex justify-between items-center mb-6 mt-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Manage Subjects
          </h1>
          <div className="flex gap-3">
            {/* Google Calendar Integration */}
            {safeSubjects.length > 0 && (
              <GoogleCalendarIntegration subjects={safeSubjects} />
            )}

            {/* Delete All Button - only show if there are subjects */}
            {safeSubjects.length > 0 && (
              <button
                onClick={handleDeleteAllSubjects}
                className="flex items-center bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                title="Hapus semua mata kuliah (untuk pindah semester)"
              >
                <Trash2 size={16} className="mr-2" />
                Delete All
              </button>
            )}

            {/* Add Subject Button */}
            <button
              onClick={handleAddSubject}
              className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              <Plus size={16} className="mr-2" />
              Add Subject
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-card rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-secondary">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Day & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Lecturer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-card divide-y divide-gray-200 dark:divide-gray-700">
                {safeSubjects.length > 0 ? (
                  safeSubjects.map((subject) => (
                    <tr
                      key={subject.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {subject.name}
                            </div>
                            {!hasValidSchedule(subject) && (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600 dark:bg-secondary dark:text-gray-300">
                                No Schedule
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {subject.id}
                          </div>
                          {subject.category && (
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                subject.category === "High"
                                  ? "bg-red-100 text-red-800"
                                  : subject.category === "Medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {subject.category}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {hasValidSchedule(subject) ? (
                          <>
                            <div className="text-sm text-gray-900 dark:text-white">
                              {subject.day}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {subject.startTime} - {subject.endTime}
                            </div>
                          </>
                        ) : (
                          <div className="text-sm text-gray-400 dark:text-gray-500 italic">
                            No schedule set
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {subject.room}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {Array.isArray(subject.lecturer) &&
                            subject.lecturer.map((lecturer, index) => (
                              <div key={index} className="truncate max-w-xs">
                                {lecturer}
                              </div>
                            ))}
                          {(!Array.isArray(subject.lecturer) ||
                            subject.lecturer.length === 0) && (
                            <div className="text-gray-500 dark:text-gray-400 italic">
                              No lecturer assigned
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {subject.meeting}/14
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-secondary">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${((subject.meeting ?? 0) / 14) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditSubject(subject)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteSubject(subject)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <p className="text-gray-500 dark:text-gray-400">
                        No subjects yet. Add your first subject!
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Subject Modal */}
      <SubjectModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveSubject}
        subject={editingSubject}
        mode={modalMode}
        showMeetingCount={true}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Confirmation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the subject &ldquo;
              {subjectToDelete?.name}&rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteSubject}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete All Confirmation Dialog */}
      <AlertDialog
        open={isDeleteAllDialogOpen}
        onOpenChange={setIsDeleteAllDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 size={20} />
              Delete All Subjects Confirmation
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p className="font-medium text-gray-900 dark:text-white">
                ⚠️ WARNING: You are about to delete ALL existing subjects!
              </p>
              <p>
                This action will permanently delete{" "}
                <strong>{subjects?.length || 0} subjects</strong> and cannot be
                undone.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This feature is useful when the semester has ended and you want
                to start a new semester with different subjects.
              </p>
              <p className="font-medium text-red-600">
                Are you sure you want to continue?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteAllSubjects}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, Delete All ({subjects?.length || 0} subjects)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ManageSubjects;
