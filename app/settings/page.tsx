"use client";

import React from "react";
import { BookOpen, Monitor, Info, Palette, Database } from "lucide-react";
import Link from "next/link";

const SettingsPage = () => {
  const settingsItems = [
    {
      icon: BookOpen,
      title: "Kelola Mata Kuliah",
      description: "Tambah, edit, dan hapus mata kuliah",
      href: "/manage-subjects",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Palette,
      title: "Tampilan",
      description: "Tema, warna, dan personalisasi",
      href: "/appearance",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: Monitor,
      title: "Preferensi",
      description: "Pengaturan umum aplikasi",
      href: "/preferences",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: Database,
      title: "Data & Penyimpanan",
      description: "Backup dan sinkronisasi data",
      href: "/data-storage",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      icon: Info,
      title: "Tentang Aplikasi",
      description: "Informasi aplikasi dan bantuan",
      href: "/about",
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    },
  ];

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Pengaturan
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Kelola akun dan mata kuliah Anda
        </p>
      </div>

      {/* Settings Items */}
      <div className="space-y-3">
        {settingsItems.map((item, index) => {
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
                    className={`w-6 h-6 ${item.color} dark:text-gray-300`}
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

      {/* App Info */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white text-center">
        <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">
          SU
        </div>
        <h3 className="font-semibold text-lg mb-2">Schedule SIAP UNDIP</h3>
        <p className="text-blue-100 text-sm">
          Kelola jadwal kuliah Anda dengan mudah dan efisien
        </p>
      </div>

      {/* Quick Access */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/manage-subjects"
          className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all"
        >
          <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            Kelola
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Mata Kuliah
          </div>
        </Link>
        <Link
          href="/about"
          className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all"
        >
          <Info className="w-8 h-8 text-gray-600 dark:text-gray-400 mx-auto mb-2" />
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            Tentang
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Aplikasi
          </div>
        </Link>
      </div>
    </div>
  );
};

export default SettingsPage;
