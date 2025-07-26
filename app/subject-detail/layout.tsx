"use client";

import BackButton from "@/components/Back-Button";
import SubjectModal from "@/components/SubjectModal";
import { Edit3 } from "lucide-react";
import React, { ReactNode, useState } from "react";
import { useParams } from "next/navigation";
import { useSubject, useSubjects, Subject } from "@/hooks/useSubjects";
import { toast } from "sonner";

const Layout = ({ children }: { children: ReactNode }) => {
  const params = useParams();
  const subjectId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { subject } = useSubject(subjectId || "");
  const { updateSubject } = useSubjects();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleSaveSubject = async (subjectData: Omit<Subject, "_id">) => {
    if (!subject) return { success: false, error: "Subject not found" };

    try {
      const result = await updateSubject(subject.id, subjectData);
      if (result.success) {
        toast.success("Mata kuliah berhasil diupdate!");
        setIsEditModalOpen(false);
        return { success: true };
      } else {
        toast.error(`Error: ${result.error || "Gagal mengupdate mata kuliah"}`);
        return { success: false, error: result.error };
      }
    } catch {
      return { success: false, error: "Terjadi kesalahan tak terduga" };
    }
  };

  return (
    <>
      <div className="">
        <section className="flex flex-row gap-2 items-center mt-4 mb-2 mx-5">
          <BackButton />
          <div className="flex flex-row justify-center items-center w-full">
            <div className="flex flex-col gap-0.5 justify-center text-center">
              <h1 className="font-bold text-xl">Subject Detail</h1>
            </div>
          </div>
          <button
            onClick={handleEdit}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Edit Subject"
          >
            <Edit3 className="w-5 h-5 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400" />
          </button>
        </section>

        {children}
      </div>

      {/* Edit Subject Modal */}
      <SubjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveSubject}
        subject={subject}
        mode="edit"
      />
    </>
  );
};

export default Layout;
