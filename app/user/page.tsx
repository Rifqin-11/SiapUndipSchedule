"use client";

import React from "react";
import {
  Edit,
  Shield,
  Bell,
  LogOut,
  Camera
} from "lucide-react";
import Link from "next/link";
import { useSubjects } from "@/hooks/useSubjects";

const UserPage = () => {
  // Get subjects data
  const { subjects } = useSubjects();

  // Mock user data - remove when auth is implemented
  const user = {
    name: "John Doe",
    email: "john.doe@students.undip.ac.id",
    image: null,
    jurusan: "Computer Science",
    nim: "24060120140157",
    angkatan: "2020",
    fakultas: "Science and Mathematics",
  };

  const handleLogout = async () => {
    // Placeholder for logout functionality
    console.log("Logout clicked");
  };

  const userMenuItems = [
    {
      icon: Edit,
      title: "Edit Profile",
      description: "Update your profile information",
      href: "/profile",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: Shield,
      title: "Security",
      description: "Password and account security",
      href: "/security",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Notification settings",
      href: "/notifications",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
  ];

  // Get initials from user name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="relative inline-block">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
            {getInitials(user?.name || "User")}
          </div>
          <button className="absolute bottom-1 right-1 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Camera className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {user?.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {user?.jurusan} - NIM: {user?.nim || "Belum diisi"}
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            {user?.email}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {subjects?.length || 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Subjects
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            85%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Attendance
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {user?.angkatan || "2024"}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Class Year
          </div>
        </div>
      </div>

      {/* Account Settings */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white px-2">
          Account Settings
        </h2>
        {userMenuItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <Link
              key={index}
              href={item.href}
              className="block p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 group"
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`p-3 rounded-xl ${item.bgColor} dark:bg-gray-700`}
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
            <p className="font-medium">{user?.fakultas || "Not filled"}</p>
          </div>
          <div>
            <p className="text-green-100">Study Program</p>
            <p className="font-medium">{user?.jurusan || "Not filled"}</p>
          </div>
          <div>
            <p className="text-green-100">Student ID</p>
            <p className="font-medium">{user?.nim || "Not filled"}</p>
          </div>
          <div>
            <p className="text-green-100">Class Year</p>
            <p className="font-medium">{user?.angkatan || "Not filled"}</p>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="w-full p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center space-x-2"
      >
        <LogOut className="w-5 h-5" />
        <span className="font-medium">Logout</span>
      </button>
    </div>
  );
};

export default UserPage;
