"use client";

import { StatsCard } from "@/components/ui/reusable-components";
import React, { useState } from "react";
import {
  Edit,
  Bell,
  LogOut,
  Camera,
  User,
  BookOpen,
  InfoIcon,
  Palette,
  History,
  PencilIcon,
  UserRoundCog,
} from "lucide-react";
import Link from "next/link";
import { useSubjects } from "@/hooks/useSubjects";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/hooks/useAuth";
import { useAttendance } from "@/hooks/useAttendance";
import Image from "next/image";
import UserPageSkeleton from "@/components/profile/UserPageSkeleton";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useScrollOpacity } from "@/hooks/useScrollOpacity";
import ThemeToggle from "@/components/ThemeToggle";
import MicrosoftLogo from "@/public/microsoft.svg";

const UserPage = () => {
  // Get subjects data
  const {
    data: subjects,
    isLoading: subjectsLoading,
    error: subjectsError,
  } = useSubjects();

  // Get user profile data
  const { user, loading: userLoading } = useUserProfile();
  const { logout } = useAuth();
  const router = useRouter();

  // Get attendance data (masih dibutuhkan untuk data lain)
  const { loading: attendanceLoading } = useAttendance();

  // State for logout loading
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Hook untuk scroll opacity effect pada header
  const scrollOpacity = useScrollOpacity({
    fadeDistance: 40,
    startOffset: 0,
  });

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success("Logged out successfully");
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSSOLogin = () => {
    window.open(
      "https://sso.undip.ac.id/pages/dashboard",
      "_blank",
      "noopener,noreferrer"
    );
  };

  const userMenuItems = [
    // {
    //   icon: Edit,
    //   title: "Edit Profile",
    //   description: "Update your profile information",
    //   href: "/user/profile",
    //   color: "text-green-600",
    //   bgColor: "bg-green-50",
    // },
    {
      icon: Bell,
      title: "Notifications",
      description: "Notification settings",
      href: "/user/notifications",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      icon: BookOpen,
      title: "Manage Subjects",
      description: "Add, edit, and delete subjects",
      href: "/settings/manage-subjects",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: History,
      title: "Attendance History",
      description: "View QR code scan history",
      href: "/settings/attendance-history",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
  ];

  // Calculate attendance percentage using subjects data directly
  const calculateTotalAttendancePercentage = () => {
    if (!subjects || subjects.length === 0) {
      return 0;
    }

    let totalAttendedMeetings = 0;
    let totalPossibleMeetings = 0;

    // Sum up all attended meetings and calculate total possible meetings per subject
    // Exclude exam schedules (UTS/UAS) from attendance calculation
    subjects.forEach((subject) => {
      // Skip exam schedules (subjects with examType field)
      if (subject.examType) {
        return; // Skip this subject
      }

      // Count attended meetings
      if (subject.attendanceDates && Array.isArray(subject.attendanceDates)) {
        totalAttendedMeetings += subject.attendanceDates.length;
      }

      // Calculate possible meetings based on subject type
      if (subject.specificDate) {
        // One-time subject: only 1 possible meeting
        totalPossibleMeetings += 1;
      } else if (subject.meetingDates && Array.isArray(subject.meetingDates)) {
        // Use actual meeting dates count (could be 14 or any number)
        totalPossibleMeetings += subject.meetingDates.length;
      } else {
        // Legacy fallback: assume 14 meetings for recurring subjects
        totalPossibleMeetings += 14;
      }
    });

    if (totalPossibleMeetings === 0) {
      return 0;
    }

    // Formula: (total attendance across all subjects / total possible meetings) × 100%
    const percentage = (totalAttendedMeetings / totalPossibleMeetings) * 100;

    console.log("Attendance Calculation:", {
      totalAttendedMeetings,
      totalSubjects: subjects.length,
      totalPossibleMeetings,
      percentage: Math.round(percentage),
      subjectsBreakdown: subjects.map((s) => ({
        name: s.name,
        attended: s.attendanceDates?.length || 0,
        possible: s.specificDate ? 1 : s.meetingDates?.length || 14,
        isOneTime: !!s.specificDate,
      })),
    });

    return Math.min(Math.round(percentage), 100);
  };

  const attendancePercentage = calculateTotalAttendancePercentage();

  // Get initials from user name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (userLoading || subjectsLoading) {
    return <UserPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section
        className="
          lg:relative lg:top-auto lg:left-auto lg:right-auto lg:z-auto lg:bg-transparent lg:backdrop-blur-none
          fixed top-0 left-0 right-0 z-50
          flex flex-row gap-2 items-center pt-4 pb-2 px-5 justify-between
        "
        style={{
          opacity: scrollOpacity < 1 ? scrollOpacity : undefined,
          pointerEvents: scrollOpacity < 0.3 ? "none" : "auto",
        }}
      >
        <div className="flex items-center">
          <ThemeToggle />
        </div>
        <div className="flex flex-row justify-center items-center flex-1">
          <div className="flex flex-col gap-0.5 justify-center text-center">
            <div className="flex items-center justify-center gap-2">
              <User className="w-6 h-6 text-green-600" />
              <h1 className="font-bold text-xl text-gray-900 dark:text-white">
                User
              </h1>
            </div>
          </div>
        </div>
        <Link href="/settings/about">
          <div className="bg-gray-400/10 hover:bg-gray-400/20 rounded-full p-3 transition-colors">
            <InfoIcon className="w-5 h-5 text-gray-400" />
          </div>
        </Link>
      </section>

      {/* Content wrapper dengan padding-top untuk fixed header di mobile */}
      <div className="pt-13 lg:pt-0">
        <div className="max-w-2xl mx-auto p-6 space-y-6">
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <Link href="/user/profile" className="">
                {user?.profileImage ? (
                  <Image
                    src={user.profileImage}
                    alt="Profile"
                    width={96}
                    height={96}
                    className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
                    {getInitials(user?.name || "User")}
                  </div>
                )}
                <Link
                  href="/user/profile"
                  className="absolute bottom-1 right-1 bg-white dark:bg-card p-2 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-background transition-colors"
                >
                  <UserRoundCog className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </Link>
              </Link>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user?.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {user?.jurusan || "-"} - NIM: {user?.nim || "-"}
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                {user?.email}
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4">
            <StatsCard
              value={
                subjectsError
                  ? "?"
                  : subjects?.filter((s) => !s.examType).length || 0
              }
              label="Subjects"
              color="text-blue-600 dark:text-blue-400"
              isLoading={subjectsLoading}
            />

            <StatsCard
              value={`${attendancePercentage}%`}
              label="Attendance"
              color="text-green-600 dark:text-green-400"
              isLoading={attendanceLoading}
            />

            <StatsCard
              value={user?.angkatan || "-"}
              label="Class Year"
              color="text-purple-600 dark:text-purple-400"
              isLoading={userLoading}
            />
          </div>

          {/* Account Settings */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white px-2">
              Application Settings
            </h2>
            {userMenuItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={index}
                  href={item.href}
                  className="block p-4 bg-white dark:bg-card rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-3 rounded-xl ${item.bgColor} dark:bg-secondary`}
                    >
                      <IconComponent
                        className={`w-5 h-5 ${item.color} dark:text-gray-300`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.description}
                      </p>
                    </div>
                    <div className="text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Academic Info */}
          <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-xl p-6 text-white">
            <h3 className="font-semibold text-lg mb-3">Academic Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-green-100">Faculty</p>
                <p className="font-medium">{user?.fakultas || "-"}</p>
              </div>
              <div>
                <p className="text-green-100">Study Program</p>
                <p className="font-medium">{user?.jurusan || "-"}</p>
              </div>
              <div>
                <p className="text-green-100">Student ID</p>
                <p className="font-medium">{user?.nim || "-"}</p>
              </div>
              <div>
                <p className="text-green-100">Class Year</p>
                <p className="font-medium">{user?.angkatan || "-"}</p>
              </div>
            </div>
          </div>

          {/* Login SSO Button */}
          <button
            onClick={handleSSOLogin}
            disabled={isLoggingOut}
            className="w-full p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Image
              src={MicrosoftLogo}
              alt="Microsoft Logo"
              className="w-5 h-5"
            />
            <span className="font-medium">Login SSO</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? (
              <>
                <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="font-medium">Logging out...</span>
              </>
            ) : (
              <>
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserPage;
