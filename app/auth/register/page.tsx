"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Mail,
  Lock,
  ArrowLeft,
  ArrowRight,
  User,
  Chrome,
  Eye,
  EyeOff,
} from "lucide-react";
import "../auth.css";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string | string[] }>(
    {}
  );

  const { register, user } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, text: "" };

    let strength = 0;
    const checks = [
      password.length >= 8,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password),
    ];

    strength = checks.filter(Boolean).length;

    const strengthText = {
      0: "",
      1: "Very Weak",
      2: "Weak",
      3: "Fair",
      4: "Good",
      5: "Strong",
    };

    const strengthColor = {
      0: "",
      1: "text-red-500",
      2: "text-orange-500",
      3: "text-yellow-500",
      4: "text-blue-500",
      5: "text-green-500",
    };

    return {
      strength,
      text: strengthText[strength as keyof typeof strengthText],
      color: strengthColor[strength as keyof typeof strengthColor],
    };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const validateForm = () => {
    const newErrors: { [key: string]: string | string[] } = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else {
      const passwordErrors = [];
      if (formData.password.length < 8) {
        passwordErrors.push("Password must be at least 8 characters long");
      }
      if (!/[a-z]/.test(formData.password)) {
        passwordErrors.push("Password must contain lowercase letters");
      }
      if (!/[A-Z]/.test(formData.password)) {
        passwordErrors.push("Password must contain uppercase letters");
      }
      if (!/[0-9]/.test(formData.password)) {
        passwordErrors.push("Password must contain numbers");
      }
      if (!/[^A-Za-z0-9]/.test(formData.password)) {
        passwordErrors.push("Password must contain special characters");
      }

      if (passwordErrors.length > 0) {
        newErrors.password = passwordErrors;
      }
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
      const result = await register({
        name: formData.name.trim(),
        email: formData.email,
        password: formData.password,
      });

      if (result.success) {
        toast.success(
          "Registration successful! Please check your email for verification."
        );
        router.push("/auth/login");
      } else {
        if (result.passwordErrors) {
          setErrors({ password: result.passwordErrors });
        } else {
          setErrors({ general: result.error || "Registration failed" });
        }
        toast.error(result.error || "Registration failed");
      }
    } catch {
      setErrors({ general: "An unexpected error occurred" });
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FF] to-[#E0E7FF] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <div className="w-full max-w-md mb-6">
        <Link
          href="/auth/login"
          className="inline-flex items-center space-x-2 text-[#94A3B8] hover:text-[#1E3A8A] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Back to login</span>
        </Link>
      </div>

      {/* Header Logo */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-[#1E3A8A] tracking-tight">
          siap undip
        </h1>
        {/* Decorative dots */}
        <div className="flex justify-center space-x-1 mt-2">
          <div className="w-2 h-2 bg-[#2563EB]/30 rounded-full"></div>
          <div className="w-2 h-2 bg-[#2563EB]/50 rounded-full"></div>
          <div className="w-2 h-2 bg-[#2563EB]/70 rounded-full"></div>
        </div>
      </div>

      {/* Register Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-[#1E3A8A]/5 p-8 animate-slide-up">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#0F172A] mb-2">
            Create your Account
          </h2>
          <p className="text-[#94A3B8] text-sm">
            Join SIAP UNDIP and manage your schedule
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm animate-fade-in">
              {errors.general}
            </div>
          )}

          {/* Name Input */}
          <div className="space-y-2">
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#94A3B8] w-5 h-5 z-10" />
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={formData.name}
                onChange={handleChange}
                className={`pl-12 h-14 dark:text-black rounded-2xl border-2 bg-[#F8FAFC] focus:bg-[#F8FAFC] transition-all duration-200 input-focus ${
                  errors.name
                    ? "border-red-300"
                    : "border-[#E2E8F0] focus:border-[#2563EB]"
                }`}
                placeholder="Enter your full name"
                disabled={isLoading}
              />
            </div>
            {errors.name && (
              <p className="text-sm text-red-600 ml-1 animate-fade-in">
                {errors.name}
              </p>
            )}
          </div>

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
                value={formData.email}
                onChange={handleChange}
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
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`pl-12 pr-12 h-14 dark:text-black rounded-2xl border-2 bg-[#F8FAFC] focus:bg-[#F8FAFC] transition-all duration-200 input-focus ${
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

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-2 space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength.strength <= 2
                          ? "bg-red-500"
                          : passwordStrength.strength <= 3
                          ? "bg-yellow-500"
                          : passwordStrength.strength <= 4
                          ? "bg-blue-500"
                          : "bg-green-500"
                      }`}
                      style={{
                        width: `${(passwordStrength.strength / 5) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span
                    className={`text-xs font-medium ${passwordStrength.color}`}
                  >
                    {passwordStrength.text}
                  </span>
                </div>

                {/* Password Requirements */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-700 mb-2">
                    Password requirements:
                  </p>
                  <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
                    <div className="flex items-center space-x-1">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          formData.password.length >= 8
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      ></div>
                      <span>8+ characters</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          /[a-z]/.test(formData.password)
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      ></div>
                      <span>Lowercase</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          /[A-Z]/.test(formData.password)
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      ></div>
                      <span>Uppercase</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          /[0-9]/.test(formData.password)
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      ></div>
                      <span>Numbers</span>
                    </div>
                    <div className="flex items-center space-x-1 col-span-2">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          /[^A-Za-z0-9]/.test(formData.password)
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      ></div>
                      <span>Special characters (!@#$%^&*)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {errors.password && (
              <div className="text-sm text-red-600 ml-1 animate-fade-in">
                {Array.isArray(errors.password) ? (
                  <ul className="list-disc list-inside space-y-1">
                    {errors.password.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                ) : (
                  <p>{errors.password}</p>
                )}
              </div>
            )}
          </div>

          {/* Confirm Password Input */}
          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#94A3B8] w-5 h-5 z-10" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`pl-12 pr-12 h-14 dark:text-black rounded-2xl border-2 bg-[#F8FAFC] focus:bg-[#F8FAFC] transition-all duration-200 input-focus ${
                  errors.confirmPassword
                    ? "border-red-300"
                    : "border-[#E2E8F0] focus:border-[#2563EB]"
                }`}
                placeholder="Confirm your password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B] transition-colors z-10"
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-600 ml-1 animate-fade-in">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Sign Up Button */}
          <Button
            type="submit"
            className="w-full h-14 bg-[#1E3A8A] hover:bg-[#1E40AF] text-white rounded-2xl text-base font-semibold shadow-lg shadow-[#1E3A8A]/25 transition-all duration-200 hover:shadow-xl hover:shadow-[#1E3A8A]/30 button-modern"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating account...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span>Create account</span>
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
                — Or sign up with —
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

      {/* Sign In Link */}
      <div className="mt-8 text-center">
        <p className="text-[#94A3B8] text-sm">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-[#2563EB] hover:text-[#1E3A8A] font-semibold transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
