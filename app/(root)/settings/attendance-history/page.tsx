"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Clock, BookOpen, Users, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import FixedHeaderLayout from "@/components/FixedHeaderLayout";
import PageHeader from "@/components/PageHeader";

interface AttendanceRecord {
  _id: string;
  subjectId: string;
  subjectName: string;
  attendanceDate: string;
  createdAt: string;
  meetingNumber: number;
}

const AttendanceHistoryPage = () => {
  const [attendanceHistory, setAttendanceHistory] = useState<
    AttendanceRecord[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchAttendanceHistory();
  }, []);

  const fetchAttendanceHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all subjects with attendance data
      const response = await fetch("/api/subjects");
      const result = await response.json();

      if (response.ok && result.success) {
        const subjects = result.data;
        const allAttendanceRecords: AttendanceRecord[] = [];

        // Extract attendance records from all subjects
        subjects.forEach((subject: any) => {
          if (subject.attendanceDates && subject.attendanceDates.length > 0) {
            subject.attendanceDates.forEach((date: string, index: number) => {
              allAttendanceRecords.push({
                _id: `${subject._id}-${index}`,
                subjectId: subject._id,
                subjectName: subject.name,
                attendanceDate: date,
                createdAt: date,
                meetingNumber: index + 1,
              });
            });
          }
        });

        // Sort by attendance date (newest first)
        const sortedHistory = allAttendanceRecords.sort(
          (a, b) =>
            new Date(b.attendanceDate).getTime() -
            new Date(a.attendanceDate).getTime()
        );

        setAttendanceHistory(sortedHistory);
      } else {
        setError(result.error || "Failed to fetch attendance history");
      }
    } catch (err) {
      setError("An error occurred while fetching attendance history");
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user) {
    return null;
  }

  return (
    <FixedHeaderLayout>
      <div className="w-full mx-auto p-4 space-y-6">
        {/* Stats Summary */}
        <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-200 dark:border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Attendance Summary
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-background/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {attendanceHistory.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Meetings
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-background/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {
                  new Set(attendanceHistory.map((record) => record.subjectId))
                    .size
                }
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Different Subjects
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-background/50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {attendanceHistory.length > 0
                  ? Math.round(
                      attendanceHistory.reduce(
                        (sum, record) => sum + record.meetingNumber,
                        0
                      ) / attendanceHistory.length
                    )
                  : 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Avg Meeting
              </div>
            </div>
          </div>
        </div>

        {/* Attendance List */}
        <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-200 dark:border-border">
          <div className="p-6 border-b border-gray-200 dark:border-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Attendance Records
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Sorted by most recent attendance
                </p>
              </div>
              <Button
                onClick={fetchAttendanceHistory}
                variant="outline"
                size="sm"
                disabled={isLoading}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-background/50 rounded-lg">
                      <div className="w-12 h-12 bg-gray-200 dark:bg-muted rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-muted rounded w-1/3"></div>
                        <div className="h-3 bg-gray-200 dark:bg-muted rounded w-1/2"></div>
                      </div>
                      <div className="h-4 bg-gray-200 dark:bg-muted rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <div className="text-red-600 dark:text-red-400 mb-2">{error}</div>
              <Button
                onClick={fetchAttendanceHistory}
                variant="outline"
                size="sm"
              >
                Try Again
              </Button>
            </div>
          ) : attendanceHistory.length === 0 ? (
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Attendance Records
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You haven't marked any attendance yet. Start attending classes
                to see your history here.
              </p>
              <Button
                onClick={() => router.push("/schedule")}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Go to Schedule
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-border">
              {attendanceHistory.map((record) => (
                <div
                  key={record._id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-background/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* Subject Icon */}
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {record.subjectName}
                      </h4>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(record.attendanceDate)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(record.attendanceDate)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Meeting Number */}
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Meeting {record.meetingNumber}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        #{record.meetingNumber.toString().padStart(2, "0")}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </FixedHeaderLayout>
  );
};

export default AttendanceHistoryPage;
