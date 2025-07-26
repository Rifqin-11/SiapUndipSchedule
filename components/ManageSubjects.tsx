"use client";

import React, { useState } from "react";
import { useSubjects, Subject } from "@/hooks/useSubjects";
import SubjectForm from "@/components/SubjectForm";
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
  } = useSubjects();
  const [showForm, setShowForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddSubject = async (subjectData: Omit<Subject, "_id">) => {
    setIsSubmitting(true);
    const result = await createSubject(subjectData);

    if (result.success) {
      setShowForm(false);
      toast.success("Mata kuliah berhasil ditambahkan!");
    } else {
      toast.error(`Error: ${result.error || "Gagal menambahkan mata kuliah"}`);
    }
    setIsSubmitting(false);
  };

  const handleEditSubject = async (subjectData: Omit<Subject, "_id">) => {
    if (!editingSubject) return;

    setIsSubmitting(true);
    const result = await updateSubject(editingSubject.id, subjectData);

    if (result.success) {
      setEditingSubject(null);
      toast.success("Mata kuliah berhasil diupdate!");
    } else {
      toast.error(`Error: ${result.error || "Gagal mengupdate mata kuliah"}`);
    }
    setIsSubmitting(false);
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus mata kuliah ini?")) {
      return;
    }

    const result = await deleteSubject(id);

    if (result.success) {
      toast.success("Mata kuliah berhasil dihapus!");
    } else {
      toast.error(`Error: ${result.error || "Gagal menghapus mata kuliah"}`);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSubject(null);
  };

  if (showForm || editingSubject) {
    return (
      <SubjectForm
        subject={editingSubject || undefined}
        onSubmit={editingSubject ? handleEditSubject : handleAddSubject}
        onCancel={handleCancel}
        isLoading={isSubmitting}
      />
    );
  }

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
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Kelola Mata Kuliah
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus size={20} />
          Tambah Mata Kuliah
        </button>
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
              {subjects.map((subject) => (
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
                        style={{ width: `${(subject.meeting / 14) * 100}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingSubject(subject)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteSubject(subject.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {subjects.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              Belum ada mata kuliah. Tambahkan mata kuliah pertama Anda!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageSubjects;
