"use client";

import React, { useState } from "react";
import { useSubjects, Subject } from "@/hooks/useSubjects";
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
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

const ManageSubjects = () => {
  const {
    subjects,
    loading,
    error,
    refetch,
    createSubject,
    updateSubject,
    deleteSubject,
    deleteAllSubjects,
  } = useSubjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Delete confirmation dialog states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);

  // Delete all confirmation dialog states
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);

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
        const result = await createSubject(subjectData);
        if (result.success) {
          toast.success("Mata kuliah berhasil ditambahkan!");
          setIsModalOpen(false);
          return { success: true };
        } else {
          toast.error(
            `Error: ${result.error || "Gagal menambahkan mata kuliah"}`
          );
          return { success: false, error: result.error };
        }
      } else if (modalMode === "edit" && editingSubject) {
        const result = await updateSubject(editingSubject.id, subjectData);
        if (result.success) {
          toast.success("Mata kuliah berhasil diupdate!");
          setIsModalOpen(false);
          return { success: true };
        } else {
          toast.error(
            `Error: ${result.error || "Gagal mengupdate mata kuliah"}`
          );
          return { success: false, error: result.error };
        }
      }
      return { success: false, error: "Mode tidak valid" };
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

    const result = await deleteSubject(subjectToDelete.id);

    if (result.success) {
      toast.success("Mata kuliah berhasil dihapus!");
    } else {
      toast.error(`Error: ${result.error || "Gagal menghapus mata kuliah"}`);
    }

    setIsDeleteDialogOpen(false);
    setSubjectToDelete(null);
  };

  const handleDeleteAllSubjects = () => {
    setIsDeleteAllDialogOpen(true);
  };

  const confirmDeleteAllSubjects = async () => {
    const result = await deleteAllSubjects();

    if (result.success) {
      toast.success(
        `Berhasil menghapus semua mata kuliah! (${result.deletedCount || 0} mata kuliah dihapus)`
      );
    } else {
      toast.error(`Error: ${result.error || "Gagal menghapus semua mata kuliah"}`);
    }

    setIsDeleteAllDialogOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSubject(null);
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
        <p className="text-red-500">{error}</p>
        <button
          onClick={refetch}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Kelola Mata Kuliah
          </h1>
          <div className="flex gap-3">
            {/* Delete All Button - only show if there are subjects */}
            {Array.isArray(subjects) && subjects.length > 0 && (
              <button
                onClick={handleDeleteAllSubjects}
                className="flex items-center bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                title="Hapus semua mata kuliah (untuk pindah semester)"
              >
                <Trash2 size={16} className="mr-2" />
                Hapus Semua
              </button>
            )}
            
            {/* Add Subject Button */}
            <button
              onClick={handleAddSubject}
              className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              <Plus size={16} className="mr-2" />
              Tambah Mata Kuliah
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Mata Kuliah
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Hari & Waktu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Ruangan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Dosen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {Array.isArray(subjects) && subjects.length > 0 ? (
                  subjects.map((subject) => (
                    <tr
                      key={subject.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {subject.name}
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
                        <div className="text-sm text-gray-900 dark:text-white">
                          {subject.day}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {subject.startTime} - {subject.endTime}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {subject.room}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {subject.lecturer.map((lecturer, index) => (
                            <div key={index} className="truncate max-w-xs">
                              {lecturer}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {subject.meeting}/14
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
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
                        Belum ada mata kuliah. Tambahkan mata kuliah pertama
                        Anda!
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

      {/* Delete All Confirmation Dialog */}
      <AlertDialog
        open={isDeleteAllDialogOpen}
        onOpenChange={setIsDeleteAllDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 size={20} />
              Konfirmasi Hapus Semua Mata Kuliah
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p className="font-medium text-gray-900 dark:text-white">
                ⚠️ PERINGATAN: Anda akan menghapus SEMUA mata kuliah yang ada!
              </p>
              <p>
                Tindakan ini akan menghapus <strong>{subjects?.length || 0} mata kuliah</strong> secara permanen 
                dan tidak dapat dibatalkan.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Fitur ini berguna ketika semester telah selesai dan Anda ingin memulai 
                semester baru dengan mata kuliah yang berbeda.
              </p>
              <p className="font-medium text-red-600">
                Apakah Anda yakin ingin melanjutkan?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteAllSubjects}
              className="bg-red-600 hover:bg-red-700"
            >
              Ya, Hapus Semua ({subjects?.length || 0} mata kuliah)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ManageSubjects;
