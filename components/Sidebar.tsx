"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Home,
  Settings2,
  ImageUp,
  Album,
  QrCode,
  ClipboardCheck,
  MoreHorizontal,
} from "lucide-react";
import { useState } from "react";
import dynamic from "next/dynamic";

const QRScanner = dynamic(() => import("./QRScanner"), {
  ssr: false,
  loading: () => null,
});
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import Image from "next/image";
import "./ui/z-index-fixes.css";

const Sidebar = () => {
  const pathname = usePathname();
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const { user: authUser } = useAuth();
  const { user } = useUserProfile();

  // Hide sidebar if no user or on auth pages
  if (!authUser || pathname.startsWith("/auth")) return null;

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/schedule", icon: Calendar, label: "Schedule" },
    { href: "/tasks", icon: ClipboardCheck, label: "Task" },
    {
      href: "/settings/manage-subjects",
      icon: Album,
      label: "Manage Subjects",
    },
    { href: "/settings/upload-krs", icon: ImageUp, label: "Upload IRS" },
  ];

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const userName = user?.name || authUser?.name || "User";
  const userEmail = user?.email || authUser?.email || "youremail@gmail.com";

  // Helper untuk kelas item menu (aktif vs normal)
  const itemBase =
    "group flex items-center gap-3 rounded-full px-3 py-2 text-sm font-medium transition-colors";
  const iconBase = "h-4 w-4 shrink-0 transition-colors";

  return (
    <>
      {/* Sidebar */}
      <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:z-50 lg:w-64 lg:flex-col">
        <div className="flex grow flex-col bg-white dark:bg-background border-r border-gray-200 dark:border-gray-800 px-4 pb-4">
          {/* Header / Brand */}
          <div className="h-16 flex items-center mt-5">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 text-white grid place-items-center font-bold">
                SU
              </div>
              <div className="leading-tight">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  SiapUndip
                </div>
                <div className="text-[10px] text-gray-700 dark:text-gray-400">
                  Manage Undip Schedule
                </div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="mt-10 flex-1">
            <ul className="flex flex-col gap-1">
              {navItems.map(({ href, icon: Icon, label }) => {
                const active = isActive(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={[
                        itemBase,
                        active
                          ? "bg-gray-100 text-gray-900 dark:bg-secondary dark:text-white"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800/60",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "grid place-items-center rounded-full size-7",
                          active
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-500 dark:bg-secondary",
                        ].join(" ")}
                      >
                        <Icon className={iconBase} />
                      </span>
                      <span>{label}</span>
                    </Link>
                  </li>
                );
              })}

              {/* Scan QR (primary) */}
              <li className="mt-3">
                <button
                  onClick={() => setIsQRScannerOpen(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold
                             bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition-colors"
                >
                  <QrCode className="h-4 w-4" />
                  Scan QR
                </button>
                {/* <Link
                  href="/qr-scanner"
                  className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold
                             bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition-colors"
                >
                  <QrCode className="h-4 w-4" />
                  Scan QR
                </Link> */}
              </li>
            </ul>
          </nav>

          {/* Footer: Settings + User card */}
          <div className="mt-2 space-y-3">
            <Link
              href="/settings"
              className={[
                "flex items-center gap-3 rounded-full px-3 py-2 text-sm font-medium transition-colors",
                isActive("/settings")
                  ? "bg-gray-100 text-gray-900 dark:bg-secondary dark:text-white"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800/60",
              ].join(" ")}
            >
              <span
                className={[
                  "grid place-items-center rounded-full size-7",
                  isActive("/settings")
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-500 dark:bg-secondary",
                ].join(" ")}
              >
                <Settings2 className="h-4 w-4" />
              </span>
              <span>Settings</span>
            </Link>

            <div
              className={[
                "rounded-xl border p-3 transition-colors",
                isActive("/user")
                  ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30"
                  : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800",
              ].join(" ")}
            >
              <Link href="/user" className="flex items-center gap-3">
                {user?.profileImage ? (
                  <Image
                    src={user.profileImage}
                    alt="Profile"
                    width={36}
                    height={36}
                    priority={true}
                    className="size-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="size-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-400 text-white grid place-items-center text-xs font-bold">
                    {userName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {userName}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                    {userEmail}
                  </p>
                </div>

                <button
                  type="button"
                  className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="More"
                >
                  <MoreHorizontal className="h-4 w-4 text-gray-500" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </aside>

      {/* Modal QR */}
      <QRScanner
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onScanSuccess={(code) => console.log("QR Code scanned:", code)}
      />
    </>
  );
};

export default Sidebar;
