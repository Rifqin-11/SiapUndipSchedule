"use client";

import BackButton from "@/components/Back-Button";
import React, { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Upload KRS
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Import jadwal kuliah dari file KRS
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="pt-6 pb-12">{children}</div>
    </div>
  );
};

export default Layout;
