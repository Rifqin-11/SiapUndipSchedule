"use client";

import SimplePageHeader from "@/components/SimplePageHeader";
import SubjectModal from "@/components/SubjectModal";
import { Edit3 } from "lucide-react";
import React, { ReactNode, useState } from "react";
import { useParams } from "next/navigation";
import { useSubject, useUpdateSubject, Subject } from "@/hooks/useSubjects";
import { toast } from "sonner";

const Layout = ({ children }: { children: ReactNode }) => {
  const params = useParams();
  const subjectId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { data: subject } = useSubject(subjectId || "");
  const updateSubjectMutation = useUpdateSubject();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleSaveSubject = async (subjectData: Omit<Subject, "_id">) => {
    if (!subject) return { success: false, error: "Subject not found" };

    try {
      await updateSubjectMutation.mutateAsync({
        id: subject.id,
        subject: subjectData,
      });

      toast.success("Subject updated successfully!");
      setIsEditModalOpen(false);
      return { success: true };
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to update subject";
      toast.error(`Error: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-background">
        {/* Simple Page Header with Edit Button */}
        <SimplePageHeader
          title="Subject Detail"
          icon="BookOpen"
          iconColor="text-blue-600"
          actionButton={
            <button
              onClick={handleEdit}
              className="flex items-center p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 shadow-sm"
              title="Edit Subject"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          }
        />

        {/* Content Area */}
        <div className="pt-18 lg:pt-6 pb-12">{children}</div>
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
