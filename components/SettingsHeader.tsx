"use client";

import React, { useState, useEffect } from "react";
import BackButton from "@/components/Back-Button";

interface SettingsHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

const SettingsHeader = ({ title, description, icon }: SettingsHeaderProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show header when scrolling up, hide when scrolling down
      if (currentScrollY < lastScrollY || currentScrollY <= 50) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  return (
    <section
      className={`bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm transition-transform duration-300 ease-in-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="max-w-4xl mx-auto px-6 py-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <div className="flex items-center gap-3">
            {icon && (
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                {icon}
              </div>
            )}
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h1>
              {description && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SettingsHeader;
