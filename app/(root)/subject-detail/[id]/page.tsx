"use client";

import { notFound } from "next/navigation";
import {
  Clock,
  MapPin,
  User,
  Calendar,
  BookOpen,
  TrendingUp,
  CalendarX,
} from "lucide-react";
import React, { use, useState } from "react";
import Timeline from "@/components/Timeline";
import RescheduleModal from "@/components/RescheduleModal";
import RescheduleHistory from "@/components/RescheduleHistory";
import { Button } from "@/components/ui/button";
import { useSubject } from "@/hooks/useSubjects";

const Page = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const { subject, loading, error } = useSubject(id);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [reschedules, setReschedules] = useState<
    {
      subjectId: string;
      originalDate: string;
      newDate: string;
      reason: string;
      startTime?: string;
      endTime?: string;
      room?: string;
      createdAt: Date;
    }[]
  >([]);

  // Fetch reschedules when component mounts
  const fetchReschedules = React.useCallback(async () => {
    try {
      const response = await fetch(`/api/subjects/${id}/reschedule`);
      const result = await response.json();
      if (result.success) {
        setReschedules(result.data.reschedules || []);
      }
    } catch (error) {
      console.error("Error fetching reschedules:", error);
    }
  }, [id]);

  React.useEffect(() => {
    if (subject?._id || subject?.id) {
      fetchReschedules();
    }
  }, [subject, fetchReschedules]);

  const handleRescheduleAdded = () => {
    fetchReschedules(); // Refresh reschedules list
  };

  if (loading) {
    return (
      <div className="max-full mx-auto p-6 space-y-6">
        {/* Loading Header */}
        <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-200 dark:border-border p-6">
          <div className="animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-200 dark:bg-muted rounded-lg"></div>
              <div className="h-8 bg-gray-200 dark:bg-muted rounded w-1/3"></div>
            </div>
            <div className="h-4 bg-gray-200 dark:bg-muted rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-muted rounded w-2/3"></div>
          </div>
        </div>

        {/* Loading Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-200 dark:border-border p-6"
            >
              <div className="animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-muted rounded-lg"></div>
                  <div className="h-5 bg-gray-200 dark:bg-muted rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-muted rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-2">
            Gagal Memuat Data
          </h3>
          <p className="text-red-700 dark:text-red-300 mb-6">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  if (!subject) {
    return notFound();
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header Card with Subject Info */}
      <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-200 dark:border-border overflow-hidden hover:shadow-md transition-shadow duration-200">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg transition-colors duration-200">
                  <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {subject.name}
                </h1>
              </div>

              {subject.category && (
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    subject.category === "High"
                      ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                      : subject.category === "Medium"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                      : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                  }`}
                >
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {subject.category} Priority
                </span>
              )}
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Mata kuliah ini merupakan bagian integral dari kurikulum yang
            dirancang untuk memberikan pemahaman mendalam tentang konsep-konsep
            fundamental dalam bidang studi. Dengan pendekatan pembelajaran yang
            interaktif dan komprehensif, mata kuliah ini bertujuan untuk
            mengembangkan kemampuan analitis dan praktis mahasiswa.
          </p>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Schedule Card */}
        <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-200 dark:border-border p-6 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg transition-colors duration-200">
              <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Jadwal
            </h3>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Hari</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {subject.day}
            </p>
          </div>
        </div>

        {/* Time Card */}
        <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-200 dark:border-border p-6 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg transition-colors duration-200">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Waktu
            </h3>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Jam Kuliah
            </p>
            <p className="font-medium text-gray-900 dark:text-white">
              {subject.startTime} - {subject.endTime}
            </p>
          </div>
        </div>

        {/* Location Card */}
        <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-200 dark:border-border p-6 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg transition-colors duration-200">
              <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Lokasi
            </h3>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Ruangan</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {subject.room}
            </p>
          </div>
        </div>
      </div>

      {/* Lecturer Card */}
      <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-200 dark:border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <User className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Dosen Pengampu
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subject.lecturer.map((lect, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-black/20 rounded-lg"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {lect
                  .split(" ")
                  .map((name) => name[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {lect}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Dosen
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress & Timeline Card */}
      <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-200 dark:border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Progress Pembelajaran
            </h3>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Pertemuan
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {subject.meeting}/14
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Progress Kehadiran</span>
            <span>{Math.round((subject.meeting / 14) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-black/20 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(subject.meeting / 14) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">
            Riwayat Pertemuan
          </h4>
          <div className="space-y-2">
            {subject.attendanceDates && subject.attendanceDates.length > 0
              ? subject.attendanceDates
                  .slice(0, 7)
                  .map((date: string, index: number) => {
                    const meetingNumber = index + 1;
                    return (
                      <Timeline
                        key={index}
                        meetingNumber={meetingNumber}
                        date={date}
                        isCompleted={true}
                      />
                    );
                  })
              : Array.from(
                  { length: Math.min(subject.meeting, 7) },
                  (_, index) => {
                    const meetingNumber = index + 1;
                    const fallbackDates = [
                      "Mon, 5 February 2025",
                      "Mon, 12 February 2025",
                      "Mon, 19 February 2025",
                      "Mon, 26 February 2025",
                      "Mon, 5 March 2025",
                      "Mon, 12 March 2025",
                      "Mon, 19 March 2025",
                    ];
                    return (
                      <Timeline
                        key={index}
                        meetingNumber={meetingNumber}
                        date={
                          fallbackDates[index] || `Meeting ${meetingNumber}`
                        }
                        isCompleted={true}
                      />
                    );
                  }
                )}
          </div>
          {(subject.attendanceDates?.length || subject.meeting) > 7 && (
            <button className="text-blue-600 dark:text-blue-400 text-sm hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors duration-200">
              Lihat semua pertemuan (
              {(subject.attendanceDates?.length || subject.meeting) - 7}{" "}
              lainnya)
            </button>
          )}
        </div>
      </div>

      {/* Reschedule Management Card */}
      <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-200 dark:border-border p-6">
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex-shrink-0">
              <CalendarX className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              Class Reschedules
            </h3>
          </div>
          <Button
            onClick={() => setIsRescheduleModalOpen(true)}
            className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700 text-white transition-colors duration-200 flex-shrink-0"
            size="sm"
          >
            <CalendarX className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Add Reschedule</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>

        <RescheduleHistory
          reschedules={reschedules}
          subjectId={id}
          onRescheduleUpdated={fetchReschedules}
        />
      </div>

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        subjectId={id}
        subjectName={subject.name}
        onRescheduleAdded={handleRescheduleAdded}
      />
    </div>
  );
};

export default Page;
