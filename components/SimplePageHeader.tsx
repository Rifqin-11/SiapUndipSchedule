"use client";

import React from "react";
import {
  User,
  Settings,
  Shield,
  Bell,
  Calendar,
  Book,
  Palette,
  Home,
  FileText,
  Upload,
  BarChart3,
  Clock,
  MapPin,
  LucideIcon,
  Info,
} from "lucide-react";
import BackButton from "./Back-Button";
import { useScrollOpacity } from "@/hooks/useScrollOpacity";

// Icon mapping untuk mendukung penggunaan dari Server Components
const iconMap: Record<string, LucideIcon> = {
  User,
  Settings,
  Shield,
  Bell,
  Calendar,
  Book,
  Palette,
  Home,
  FileText,
  Upload,
  BarChart3,
  Clock,
  MapPin,
  Info,
};

interface SimplePageHeaderProps {
  /** Judul halaman */
  title: string;
  /** Icon yang akan ditampilkan di sebelah judul (gunakan string untuk Server Components) */
  icon?: LucideIcon | string;
  /** Warna icon (default: text-green-600) */
  iconColor?: string;
  /** Custom className untuk section */
  className?: string;
}

const SimplePageHeader: React.FC<SimplePageHeaderProps> = ({
  title,
  icon,
  iconColor = "text-green-600",
  className = "",
}) => {
  // Hook untuk scroll opacity effect
  const scrollOpacity = useScrollOpacity({
    fadeDistance: 50,
    startOffset: 10,
  });

  // Determine the icon component to render
  let IconComponent: LucideIcon | null = null;

  if (typeof icon === "string") {
    IconComponent = iconMap[icon];
  } else if (icon) {
    IconComponent = icon;
  }
  return (
    <section
      className={`
        lg:relative lg:top-auto lg:left-auto lg:right-auto lg:z-auto lg:bg-transparent lg:backdrop-blur-none
        fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm
        flex flex-row items-center pt-4 pb-2 px-5 ${className}
      `}
      style={{ opacity: scrollOpacity < 1 ? scrollOpacity : undefined }}
    >
      <BackButton />

      {/* Content di tengah */}
      <div className="flex-1 flex justify-center items-center">
        <div className="flex flex-col gap-0.5 justify-center text-center">
          <div className="flex items-center justify-center gap-2">
            {IconComponent && (
              <IconComponent className={`w-6 h-6 ${iconColor}`} />
            )}
            <h1 className="font-bold text-xl text-gray-900 dark:text-white">
              {title}
            </h1>
          </div>
        </div>
      </div>

      {/* Spacer untuk menyeimbangkan - lebar yang sama dengan back button */}
      <div className="w-10"></div>
    </section>
  );
};

export default SimplePageHeader;
