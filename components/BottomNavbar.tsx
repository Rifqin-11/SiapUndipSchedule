"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Home, CheckCircle, UserRound, QrCode } from "lucide-react";
import { useState, useEffect } from "react";
import QRScanner from "./QRScanner";
import { useAuth } from "@/hooks/useAuth";

const BottomNavbar = () => {
  const pathname = usePathname();
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const { user } = useAuth();

  // Detect if app is running as PWA
  useEffect(() => {
    const checkPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInAppBrowser = (window.navigator as any).standalone === true;
      setIsPWA(isStandalone || isInAppBrowser);
    };

    checkPWA();

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', checkPWA);

    return () => {
      mediaQuery.removeEventListener('change', checkPWA);
    };
  }, []);

  // Don't show navbar on auth pages or when user is not logged in
  if (!user || pathname.startsWith("/auth")) {
    return null;
  }

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/schedule", icon: Calendar, label: "Schedule" },
    { href: "/tasks", icon: CheckCircle, label: "Tasks" },
    { href: "/user", icon: UserRound, label: "Profile" },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <div className={`fixed left-1/2 transform -translate-x-1/2 z-50 lg:hidden ${isPWA ? 'bottom-6' : 'bottom-4'}`}>
        <div
          className="w-[360px] h-[70px] px-6 rounded-full flex justify-between items-center
          shadow-xl relative border border-white/20
          bg-black/30 backdrop-blur-md"
        >
          {/* Left Items */}
          <div className="flex gap-8">
            {navItems.slice(0, 2).map(({ href, icon: Icon, label }) => (
              <Link
                href={href}
                key={href}
                className="flex flex-col items-center"
              >
                <Icon
                  className={`h-6 w-6 transition-colors ${
                    isActive(href)
                      ? "text-gray-300 fill-white"
                      : "text-white/70"
                  }`}
                />
                <span
                  className={`text-xs ${
                    isActive(href) ? "text-white" : "text-white/60"
                  }`}
                >
                  {label}
                </span>
              </Link>
            ))}
          </div>

          {/* Center Floating QR Button */}
          <div className="absolute left-1/2 top-[-30%] transform -translate-x-1/2  p-1 rounded-full shadow-xl">
            <button
              onClick={() => setIsQRScannerOpen(true)}
              className="bg-gradient-to-r from-blue-700 to-sky-800 hover:brightness-110 transition-all duration-300 w-16 h-16 rounded-full flex items-center justify-center border-4 border-black/40"
            >
              <QrCode className="h-7 w-7 text-white" />
            </button>
          </div>

          {/* Right Items */}
          <div className="flex gap-8">
            {navItems.slice(2).map(({ href, icon: Icon, label }) => (
              <Link
                href={href}
                key={href}
                className="flex flex-col items-center"
              >
                <Icon
                  className={`h-6 w-6 transition-colors ${
                    isActive(href)
                      ? "text-gray-300 fill-white"
                      : "text-white/70"
                  }`}
                />
                <span
                  className={`text-xs ${
                    isActive(href) ? "text-white" : "text-white/60"
                  }`}
                >
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onScanSuccess={(code) => console.log("QR Code scanned:", code)}
      />
    </>
  );
};

export default BottomNavbar;
