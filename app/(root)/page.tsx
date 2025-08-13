"use client";

import React, { useState } from "react";
import CoursesCard from "@/components/CoursesCard";
import TodaySubject from "@/components/TodaySubject";
import CurrentDayDate from "@/components/CurrentDayDate";
import FloatingActionButton from "@/components/FloatingActionButton";
import SubjectModal from "@/components/SubjectModal";
import { useSubjects, Subject } from "@/hooks/useSubjects";
import { CheckCircle, TrendingUp, Award, BookOpen, Plus } from "lucide-react";

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
              <div className="w-full max-w-xs mx-auto">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-2 border border-blue-200 dark:border-blue-800 shadow-sm">
                  <div className="text-center">
                    <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-800/50 rounded-full flex items-center justify-center mb-3">
                      <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-base font-semibold text-blue-900 dark:text-blue-200 mb-1">
                      No Courses Yet
                    </h3>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                      Start building your schedule
                    </p>
                    <div className="flex items-center justify-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                      <Plus className="w-3 h-3" />
                      <span>Add course</span>
                    </div>
                  </div>
                </div>
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
              <div className="w-full max-w-md mx-auto">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-800/50 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-1">
                        Excellent Progress!
                      </h3>
                      <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                        All your courses are above 75%
                      </p>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                          Keep up the great work!
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <Award className="w-8 h-8 text-yellow-500 dark:text-yellow-400" />
                    </div>
                  </div>
                </div>
              </div>
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
