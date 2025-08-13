"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, MapPin, FileText, Users } from "lucide-react";

interface AttendanceRecord {
  id: string;
  subjectId: string;
  subjectName: string;
  attendanceDate: Date;
  location: string;
  notes: string;
  createdAt: Date;
}

interface GroupedAttendance {
  [date: string]: AttendanceRecord[];
}

export default function AttendanceHistoryPage() {
  const [attendanceHistory, setAttendanceHistory] = useState<GroupedAttendance>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAttendanceHistory();
  }, []);

  const fetchAttendanceHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/attendance-history");

      if (!response.ok) {
        throw new Error("Failed to fetch attendance history");
      }

      const data = await response.json();
      setAttendanceHistory(data.history || {});
    } catch (err) {
      console.error("Error fetching attendance history:", err);
      setError("Gagal memuat riwayat absensi");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Hari Ini";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Kemarin";
    } else {
      return date.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat riwayat absensi...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <div className="text-red-600 mb-4">
              <Users className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Terjadi Kesalahan
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button
              onClick={fetchAttendanceHistory}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              Coba Lagi
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const sortedDates = Object.keys(attendanceHistory).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <CalendarDays className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Riwayat Absensi</h1>
        </div>
        <p className="text-gray-600">Riwayat absensi 7 hari terakhir</p>
      </div>

      {/* Refresh Button */}
      <div className="mb-6">
        <Button
          onClick={fetchAttendanceHistory}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Clock className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Attendance History Content */}
      {sortedDates.length === 0 ? (
        <div className="text-center py-12">
          <CalendarDays className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Belum Ada Riwayat Absensi
          </h3>
          <p className="text-gray-500 mb-6">
            Belum ada data absensi dalam 7 hari terakhir
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => (
            <div
              key={date}
              className="bg-white rounded-lg shadow-sm border border-gray-200"
            >
              {/* Date Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-blue-600" />
                  {formatDate(date)}
                </h2>
                <p className="text-sm text-gray-600">
                  {attendanceHistory[date].length} mata kuliah diabsen
                </p>
              </div>

              {/* Attendance Records */}
              <div className="divide-y divide-gray-100">
                {attendanceHistory[date].map((record) => (
                  <div
                    key={record.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Subject Name */}
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {record.subjectName}
                        </h3>

                        {/* Details */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>
                              Absen pada:{" "}
                              {formatTime(record.attendanceDate.toString())}
                            </span>
                          </div>

                          {record.location && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="h-4 w-4" />
                              <span>Lokasi: {record.location}</span>
                            </div>
                          )}

                          {record.notes && (
                            <div className="flex items-start gap-2 text-sm text-gray-600">
                              <FileText className="h-4 w-4 mt-0.5" />
                              <span>Catatan: {record.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="ml-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Hadir
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Card */}
      {sortedDates.length > 0 && (
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Ringkasan Absensi
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {sortedDates.length}
              </div>
              <div className="text-sm text-gray-600">Hari dengan absensi</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Object.values(attendanceHistory).flat().length}
              </div>
              <div className="text-sm text-gray-600">
                Total mata kuliah diabsen
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {(
                  (Object.values(attendanceHistory).flat().length /
                    (sortedDates.length * 5)) *
                  100
                ).toFixed(0)}
                %
              </div>
              <div className="text-sm text-gray-600">Tingkat kehadiran</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
