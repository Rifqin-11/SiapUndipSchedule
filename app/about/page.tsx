"use client";

import React from "react";
import { Info, Github, Mail, Code, Heart } from "lucide-react";
import BackButton from "@/components/Back-Button";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <section className="flex flex-row gap-2 items-center pt-4 pb-2 mx-5">
        <BackButton />
        <div className="flex flex-row justify-center items-center w-full">
          <div className="flex flex-col gap-0.5 justify-center text-center">
            <div className="flex items-center justify-center gap-2">
              <Info className="w-6 h-6 text-gray-600" />
              <h1 className="font-bold text-xl text-gray-900 dark:text-white">
                Tentang
              </h1>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* App Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
            SU
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Schedule SIAP UNDIP
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Aplikasi manajemen jadwal kuliah untuk mahasiswa Universitas
            Diponegoro
          </p>
          <div className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
            Versi 1.0.0
          </div>
        </div>

        {/* Features */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Fitur Utama
          </h3>
          <div className="space-y-3">
            {[
              "📅 Lihat jadwal kuliah harian dan mingguan",
              "✏️ Tambah, edit, dan hapus mata kuliah",
              "🔔 Notifikasi pengingat kelas",
              "📊 Tracking progress pertemuan",
              "🌙 Mode gelap dan terang",
              "📱 Responsive untuk semua perangkat",
            ].map((feature, index) => (
              <div key={index} className="text-gray-700 dark:text-gray-300">
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Code className="w-5 h-5" />
            Teknologi
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl mb-1">⚛️</div>
              <div className="font-medium text-gray-900 dark:text-white">
                Next.js
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                React Framework
              </div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl mb-1">🎨</div>
              <div className="font-medium text-gray-900 dark:text-white">
                Tailwind CSS
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Styling
              </div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl mb-1">🍃</div>
              <div className="font-medium text-gray-900 dark:text-white">
                MongoDB
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Database
              </div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl mb-1">📱</div>
              <div className="font-medium text-gray-900 dark:text-white">
                TypeScript
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Type Safety
              </div>
            </div>
          </div>
        </div>

        {/* Developer */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Developer
          </h3>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              RN
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Rifqi Naufal
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Teknik Komputer, UNDIP
              </p>
              <div className="flex items-center gap-4 mt-2">
                <a
                  href="https://github.com/Rifqin-11"
                  className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
                <a
                  href="mailto:rifqi.naufal@students.undip.ac.id"
                  className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <Mail className="w-4 h-4" />
                  Email
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            ⚠️ Disclaimer
          </h3>
          <p className="text-yellow-700 dark:text-yellow-300 text-sm">
            Aplikasi ini merupakan proyek independen dan tidak berafiliasi resmi
            dengan Universitas Diponegoro atau sistem SIAP UNDIP. Dibuat untuk
            membantu mahasiswa dalam mengelola jadwal kuliah.
          </p>
        </div>

        {/* Made with Love */}
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <span>Dibuat dengan</span>
            <Heart className="w-4 h-4 text-red-500 fill-current" />
            <span>untuk mahasiswa UNDIP</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
