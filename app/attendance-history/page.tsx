"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  History,
  ExternalLink,
  Calendar,
  Clock,
  QrCode,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AttendanceRecord {
  id: string;
  code: string;
  url: string;
  timestamp: string;
  createdAt: string;
}

const AttendanceHistoryPage = () => {
  const [attendanceHistory, setAttendanceHistory] = useState<
    AttendanceRecord[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAttendanceHistory();
  }, []);

  const fetchAttendanceHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/attendance-history");
      const result = await response.json();

      if (result.success) {
        setAttendanceHistory(result.data);
      } else {
        setError("Gagal memuat riwayat absen");
      }
    } catch (error) {
      console.error("Fetch attendance history error:", error);
      setError("Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleOpenUrl = (url: string) => {
    window.open(url, "_blank");
    toast.success("Membuka halaman SIAP UNDIP");
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-4 border border-gray-200"
            >
              <div className="w-full h-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/settings">
          <Button variant="ghost" size="sm" className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
            <History className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Riwayat Absen
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Riwayat scan QR code untuk absen kuliah
            </p>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <p className="text-red-700 dark:text-red-400">{error}</p>
          <Button onClick={fetchAttendanceHistory} className="mt-2" size="sm">
            Coba Lagi
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!error && attendanceHistory.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
          <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Belum Ada Riwayat Absen
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Scan QR code untuk absen kuliah dan riwayat akan muncul di sini
          </p>
          <Link href="/schedule">
            <Button>
              <QrCode className="w-4 h-4 mr-2" />
              Mulai Absen
            </Button>
          </Link>
        </div>
      )}

      {/* Attendance List */}
      {attendanceHistory.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {attendanceHistory.length} Riwayat Absen
            </h2>
            <Button
              onClick={fetchAttendanceHistory}
              variant="outline"
              size="sm"
            >
              Refresh
            </Button>
          </div>

          {attendanceHistory.map((record) => (
            <div
              key={record.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded">
                      <QrCode className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="font-mono text-sm text-gray-900 dark:text-white font-medium">
                      {record.code}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(record.timestamp)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(record.timestamp)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => handleOpenUrl(record.url)}
                  variant="outline"
                  size="sm"
                  className="ml-4 text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Buka
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AttendanceHistoryPage;
