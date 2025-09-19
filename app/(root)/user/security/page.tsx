"use client";

import React, { useState } from "react";
import { Shield, Eye, EyeOff, ArrowLeft, Lock, Check } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import SimplePageHeader from "@/components/SimplePageHeader";

const SecurityPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters long";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword =
        "New password must be different from current password";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important: include cookies for authentication
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Password changed successfully");
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        router.push("/user");
      } else {
        toast.error(data.message || "Failed to change password");
        if (data.field) {
          setErrors({ [data.field]: data.message });
        }
      }
    } catch (error) {
      console.error("Change password error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
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

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <SimplePageHeader
        title="Security"
        icon="Shield" // ← String
        iconColor="text-purple-600"
      />

      <div className="max-w-2xl mx-auto pt-25 lg:pt-10 p-6">
        {/* Change Password Section */}
        <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Change Password
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Update your password to keep your account secure
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.currentPassword
                      ? "border-red-300 dark:border-red-600"
                      : "border-gray-300 dark:border-gray-600"
                  } bg-white dark:bg-background text-gray-900 dark:text-white`}
                  placeholder="Enter your current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.currentPassword}
                </p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.newPassword
                      ? "border-red-300 dark:border-red-600"
                      : "border-gray-300 dark:border-gray-600"
                  } bg-white dark:bg-background text-gray-900 dark:text-white`}
                  placeholder="Enter your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.newPassword && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 dark:bg-secondary rounded-full h-2">
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
                </div>
              )}

              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.newPassword}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.confirmPassword
                      ? "border-red-300 dark:border-red-600"
                      : "border-gray-300 dark:border-gray-600"
                  } bg-white dark:bg-background text-gray-900 dark:text-white`}
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {formData.confirmPassword &&
                  formData.newPassword === formData.confirmPassword && (
                    <div className="absolute inset-y-0 right-10 flex items-center pr-3">
                      <Check className="w-5 h-5 text-green-500" />
                    </div>
                  )}
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="bg-gray-50 dark:bg-secondary rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Password Requirements:
              </h4>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <li className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      formData.newPassword.length >= 8
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  ></div>
                  <span>At least 8 characters long</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      /[a-z]/.test(formData.newPassword)
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  ></div>
                  <span>Contains lowercase letters</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      /[A-Z]/.test(formData.newPassword)
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  ></div>
                  <span>Contains uppercase letters</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      /[0-9]/.test(formData.newPassword)
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  ></div>
                  <span>Contains numbers</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      /[^A-Za-z0-9]/.test(formData.newPassword)
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  ></div>
                  <span>Contains special characters</span>
                </li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4 pt-4">
              <Link
                href="/user"
                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-background transition-colors text-center font-medium"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-medium disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Changing...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Change Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Security Tips */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            Security Tips
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
            <li className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <span>
                Use a unique password that you don&apos;t use for other accounts
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <span>
                Include a mix of letters, numbers, and special characters
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <span>
                Avoid using personal information like your name or birthdate
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <span>
                Consider using a password manager to generate and store secure
                passwords
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SecurityPage;
