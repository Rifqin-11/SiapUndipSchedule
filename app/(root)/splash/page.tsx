"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import "./splash.css";

export default function SplashScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      // Wait for auth loading to complete
      if (!loading) {
        if (user) {
          router.push("/");
        } else {
          router.push("/auth/login");
        }
      }
    }, 3000); // Show splash for 3 seconds

    return () => clearTimeout(timer);
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] flex items-center justify-center relative overflow-hidden">
      {/* Decorative dots pattern */}
      <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-float">
        <div className="flex space-x-2 mb-4">
          <div className="w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse delay-100"></div>
          <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse delay-200"></div>
          <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse delay-300"></div>
          <div className="w-2 h-2 bg-white/70 rounded-full animate-pulse delay-400"></div>
        </div>
        <div className="flex space-x-3 ml-4">
          <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse delay-500"></div>
          <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-pulse delay-600"></div>
          <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-pulse delay-700"></div>
        </div>
      </div>

      {/* Logo */}
      <div className="text-center animate-fade-in">
        <h1 className="text-6xl font-bold text-white tracking-tight">
          siap undip
        </h1>
        <div className="mt-8">
          <div className="w-8 h-1 bg-white/60 rounded-full mx-auto animate-pulse"></div>
        </div>
      </div>

      {/* Subtle loading indicator */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce delay-100"></div>
          <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce delay-200"></div>
        </div>
      </div>
    </div>
  );
}
