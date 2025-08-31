"use client";

import BackButton from "@/components/Back-Button";
import SubjectModal from "@/components/subject-detail/SubjectModal";
import { Edit3 } from "lucide-react";
import React, { ReactNode, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSubject, useSubjects, Subject } from "@/hooks/useSubjects";
import { toast } from "sonner";

const Layout = ({ children }: { children: ReactNode }) => {
  const params = useParams();
  const subjectId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { subject } = useSubject(subjectId || "");
  const { updateSubject } = useSubjects();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [prevScrollY, setPrevScrollY] = useState(0);
  const [hideHeader, setHideHeader] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > prevScrollY && currentScrollY > 50) {
        setHideHeader(true);
      } else {
        setHideHeader(false);
      }

      setPrevScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollY]);

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
      <div className="min-h-screen bg-gray-50 dark:bg-background">
        {/* Header yang bisa disembunyikan */}
        <section
          className={`bg-white dark:bg-card border-b border-gray-200 dark:border-border sticky top-0 z-10 transition-transform duration-300 ${
            hideHeader ? "-translate-y-full" : "translate-y-0"
          }`}
        >
          <div className="max-full mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <BackButton />
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Detail Mata Kuliah
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Informasi lengkap tentang mata kuliah
                  </p>
                </div>
              </div>

              <button
                onClick={handleEdit}
                className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 shadow-sm"
                title="Edit Subject"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Edit</span>
              </button>
            </div>
          </div>
        </section>

        {/* Content Area */}
        <div className="pt-6 pb-12">{children}</div>
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
