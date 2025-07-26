"use client";

import BackButton from "@/components/Back-Button";
import { Edit3 } from "lucide-react";
import React, { ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";

const Layout = ({ children }: { children: ReactNode }) => {
  const params = useParams();
  const router = useRouter();

  const handleEdit = () => {
    const subjectId = params.id;
    router.push(`/edit-subject/${subjectId}`);
  };

  return (
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
  );
};

export default Layout;
