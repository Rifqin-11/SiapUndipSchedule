"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSubject } from "@/hooks/useSubjects";
import SubjectForm from "@/components/subject-detail/SubjectForm";
import { Subject } from "@/hooks/useSubjects";
import { toast } from "sonner";

const EditSubjectPage = () => {
  const params = useParams();
  const router = useRouter();
  const subjectId = params.id as string;

  const { subject, loading, error } = useSubject(subjectId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdateSubject = async (subjectData: Omit<Subject, "_id">) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/subjects/${subjectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subjectData),
      });

      if (response.ok) {
        toast.success("Mata kuliah berhasil diupdate!");
        router.push(`/subject-detail/${subjectId}`);
      } else {
        const errorData = await response.json();
        toast.error(
          `Error: ${errorData.error || "Gagal mengupdate mata kuliah"}`
        );
      }
    } catch (err) {
      toast.error("Error: Gagal mengupdate mata kuliah");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/subject-detail/${subjectId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !subject) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
        <p className="text-red-500">Mata kuliah tidak ditemukan</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-6">
      <SubjectForm
        subject={subject}
        onSubmit={handleUpdateSubject}
        onCancel={handleCancel}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default EditSubjectPage;
