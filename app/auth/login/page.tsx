"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Mail, Lock, ArrowRight, Chrome, Eye, EyeOff } from "lucide-react";
import "../auth.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { login, user } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const result = await login(email, password, rememberMe);

      if (result.success) {
        toast.success("Login successful!");
        router.push("/");
      } else {
        setErrors({ general: result.error || "Login failed" });
        toast.error(result.error || "Login failed");
      }
    } catch {
      setErrors({ general: "An unexpected error occurred" });
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FF] to-[#E0E7FF] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Header Logo */}
      <div className="mb-12 mt-10 text-center">
        <h1 className="text-4xl font-bold text-[#1E3A8A] tracking-tight">
          SIAP Undip
        </h1>
        {/* Decorative dots */}
        <div className="flex justify-center space-x-1 mt-2">
          <div className="w-2 h-2 bg-[#2563EB]/30 rounded-full"></div>
          <div className="w-2 h-2 bg-[#2563EB]/50 rounded-full"></div>
          <div className="w-2 h-2 bg-[#2563EB]/70 rounded-full"></div>
        </div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-[#1E3A8A]/5 p-8 animate-slide-up">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#0F172A] mb-2">
            Login to your Account
          </h2>
          <p className="text-[#94A3B8] text-sm">
            Welcome back! Please enter your details
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm animate-fade-in">
              {errors.general}
            </div>
          )}

          {/* Email Input */}
          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#94A3B8] w-5 h-5 z-10" />
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`pl-12 h-14 dark:text-black rounded-2xl border-2 bg-[#F8FAFC] focus:bg-[#F8FAFC] transition-all duration-200 input-focus ${
                  errors.email
                    ? "border-red-300"
                    : "border-[#E2E8F0] focus:border-[#2563EB]"
                }`}
                placeholder="Enter your email"
                disabled={isLoading}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-600 ml-1 animate-fade-in">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#94A3B8] w-5 h-5 z-10" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`pl-12 dark:text-black pr-12 h-14 rounded-2xl border-2 bg-[#F8FAFC] focus:bg-[#F8FAFC] transition-all duration-200 input-focus ${
                  errors.password
                    ? "border-red-300"
                    : "border-[#E2E8F0] focus:border-[#2563EB]"
                }`}
                placeholder="Enter your password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B] transition-colors z-10"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600 ml-1 animate-fade-in">
                {errors.password}
              </p>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                disabled={isLoading}
                className="rounded-md"
              />
              <label
                htmlFor="rememberMe"
                className="text-sm text-[#0F172A] cursor-pointer"
              >
                Remember me
              </label>
            </div>
            <Link
              href="/auth/forgot-password"
              className="text-sm text-[#2563EB] hover:text-[#1E3A8A] transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* Sign In Button */}
          <Button
            type="submit"
            className="w-full h-14 bg-[#1E3A8A] hover:bg-[#1E40AF] text-white rounded-2xl text-base font-semibold shadow-lg shadow-[#1E3A8A]/25 transition-all duration-200 hover:shadow-xl hover:shadow-[#1E3A8A]/30 button-modern"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span>Sign in</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            )}
          </Button>

          {/* Divider */}
          <div className="relative flex items-center justify-center py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E2E8F0]"></div>
            </div>
            <div className="relative bg-white px-4">
              <span className="text-sm text-[#94A3B8]">
                — Or sign in with —
              </span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              className="flex items-center justify-center h-12 bg-white border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all duration-200 social-btn"
              disabled={isLoading}
            >
              <Chrome className="w-5 h-5 text-[#4285F4]" />
            </button>
            <button
              type="button"
              className="flex items-center justify-center h-12 bg-white border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all duration-200 social-btn"
              disabled={isLoading}
            >
              <svg
                className="w-5 h-5 text-[#1877F2]"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </button>
            <button
              type="button"
              className="flex items-center justify-center h-12 bg-white border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all duration-200 social-btn"
              disabled={isLoading}
            >
              <svg
                className="w-5 h-5 text-[#1DA1F2]"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      {/* Sign Up Link */}
      <div className="mt-8 text-center mb-10">
        <p className="text-[#94A3B8] text-sm">
          Don&#39;t have an account?{" "}
          <Link
            href="/auth/register"
            className="text-[#2563EB] hover:text-[#1E3A8A] font-semibold transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
