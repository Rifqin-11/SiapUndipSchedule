"use client";

import React, { useState } from "react";
import CoursesCard from "@/components/CoursesCard";
import TodaySubject from "@/components/TodaySubject";
import CurrentDayDate from "@/components/CurrentDayDate";
import FloatingActionButton from "@/components/FloatingActionButton";
import SubjectModal from "@/components/SubjectModal";
import { useSubjects, Subject } from "@/hooks/useSubjects";

const MAX_MEETING = 14;

const Page = () => {
  const { subjects, loading, createSubject, refetch } = useSubjects();

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddSubject = () => {
    setIsModalOpen(true);
  };

  const handleSaveSubject = async (subjectData: Omit<Subject, "_id">) => {
    try {
      const result = await createSubject(subjectData);
      if (result.success) {
        refetch();
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch {
      return { success: false, error: "Terjadi kesalahan tak terduga" };
    }
  };

  const allMeetingsSafe = subjects.every(
    (subject) => (subject.meeting / MAX_MEETING) * 100 >= 75
  );

  if (loading) {
    return (
      <main className="animate-fadeIn">
        <section className="flex flex-col mt-6 mx-6 text-lg dark:text-white space-y-1">
          <h1 className="text-xl font-extrabold tracking-tight">
            Hi, here&apos;s your schedule
          </h1>
          <CurrentDayDate />
        </section>

        <section className="mt-6 dark:text-white">
          <div className="flex flex-row justify-between items-center mx-6 mb-2">
            <h2 className="font-bold text-xl">Your Courses</h2>
            <button className="text-xs text-blue-600 hover:underline dark:text-blue-400">
              View more
            </button>
          </div>

          <div className="overflow-x-auto px-6 py-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            <div className="flex gap-4">
              <div className="animate-pulse">
                <div className="w-[280px] h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
              <div className="animate-pulse">
                <div className="w-[280px] h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 mx-6 dark:text-white">
          <div className="flex flex-row justify-between items-center mb-2">
            <h2 className="font-bold text-xl">Today&apos;s Schedule</h2>
          </div>

          <div className="animate-pulse space-y-3">
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="animate-fadeIn">
      <section className="flex flex-col mt-6 mx-6 text-lg dark:text-white space-y-1">
        <h1 className="text-xl font-extrabold tracking-tight">
          Hi, here&apos;s your schedule
        </h1>
        <CurrentDayDate />
      </section>

      <section className="mt-6 dark:text-white">
        <div className="flex flex-row justify-between items-center mx-6 mb-2">
          <h2 className="font-bold text-xl">Your Courses</h2>
          <button className="text-xs text-blue-600 hover:underline dark:text-blue-400">
            View more
          </button>
        </div>

        <div className="overflow-x-auto px-6 py-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          <div className="flex gap-4">
            {subjects.length === 0 ? (
              <div className="w-full text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  No courses found
                </p>
              </div>
            ) : !allMeetingsSafe ? (
              subjects.map((subject) => (
                <div
                  key={subject._id}
                  className="w-[280px] shrink-0 transition-transform duration-200 hover:scale-105"
                >
                  <CoursesCard {...subject} />
                </div>
              ))
            ) : (
              <p className="text-sm text-green-700 dark:text-green-300">
                All your courses are above 75%.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="mt-6 mx-6 dark:text-white">
        <div className="flex flex-row justify-between items-center mb-2">
          <h2 className="font-bold text-xl">Today&apos;s Schedule</h2>
        </div>

        <TodaySubject />
      </section>

      {/* Floating Action Button */}
      <FloatingActionButton onClick={handleAddSubject} />

      {/* Subject Modal */}
      <SubjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSubject}
        mode="add"
      />
    </main>
  );
};

export default Page;
