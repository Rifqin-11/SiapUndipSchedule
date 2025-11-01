"use client";

import React, { useState, useEffect } from "react";
import { User, Camera, Save, Shield } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { toast } from "sonner";
import Image from "next/image";
import ProfilePageSkeleton from "@/components/profile/ProfilePageSkeleton";
import Link from "next/link";
import SimplePageHeader from "@/components/SimplePageHeader";
import FixedHeaderLayout from "@/components/FixedHeaderLayout";

const ProfilePage = () => {
  const { user, loading, updateUserProfile, getInitials } = useUserProfile();
  const [formData, setFormData] = useState({
    name: "",
    nim: "",
    email: "",
    jurusan: "",
    fakultas: "",
    angkatan: "",
    profileImage: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    null
  );

  // Update form data when user data is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        nim: user.nim || "",
        email: user.email || "",
        jurusan: user.jurusan || "",
        fakultas: user.fakultas || "",
        angkatan: user.angkatan || "",
        profileImage: user.profileImage || "",
      });
      setProfileImagePreview(user.profileImage || null);
    }
  }, [user]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfileImagePreview(result);
        setFormData((prev) => ({ ...prev, profileImage: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await updateUserProfile(formData);

      if (result.success) {
        toast.success("Profile updated successfully!");
        setIsEditing(false);
      } else {
        toast.error(result.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || "",
        nim: user.nim || "",
        email: user.email || "",
        jurusan: user.jurusan || "",
        fakultas: user.fakultas || "",
        angkatan: user.angkatan || "",
        profileImage: user.profileImage || "",
      });
      setProfileImagePreview(user.profileImage || null);
    }
    setIsEditing(false);
  };

  if (loading) {
    return <ProfilePageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <SimplePageHeader
        title="Profile"
        icon="User"
        iconColor="text-green-600"
      />

      <FixedHeaderLayout>
        <div className="max-w-2xl mx-auto p-6 space-y-6">
          {/* Profile Picture */}
          <div className="text-center">
            <div className="relative inline-block">
              {profileImagePreview ? (
                <Image
                  src={profileImagePreview}
                  alt="Profile"
                  width={128}
                  height={128}
                  className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto">
                  {getInitials(formData.name)}
                </div>
              )}

              {isEditing && (
                <label className="absolute bottom-2 right-2 bg-white dark:bg-card p-2 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                  <Camera className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-card rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Profile Information
              </h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    {isLoading ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-secondary dark:text-white"
                    required
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 dark:bg-background rounded-lg text-gray-900 dark:text-white">
                    {formData.name}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  NIM
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.nim}
                    onChange={(e) =>
                      setFormData({ ...formData, nim: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-secondary dark:text-white"
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 dark:bg-background rounded-lg text-gray-900 dark:text-white">
                    {formData.nim}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-secondary dark:text-white"
                    required
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 dark:bg-background rounded-lg text-gray-900 dark:text-white">
                    {formData.email}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Jurusan
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.jurusan}
                    onChange={(e) =>
                      setFormData({ ...formData, jurusan: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-secondary dark:text-white"
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 dark:bg-background rounded-lg text-gray-900 dark:text-white">
                    {formData.jurusan}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fakultas
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.fakultas}
                    onChange={(e) =>
                      setFormData({ ...formData, fakultas: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-secondary dark:text-white"
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 dark:bg-background rounded-lg text-gray-900 dark:text-white">
                    {formData.fakultas}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Angkatan
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.angkatan}
                    onChange={(e) =>
                      setFormData({ ...formData, angkatan: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-secondary dark:text-white"
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 dark:bg-background rounded-lg text-gray-900 dark:text-white">
                    {formData.angkatan}
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Single menu entry — rendered inline to avoid array mapping */}
          <Link
            href="/user/security"
            className="block p-4 bg-white dark:bg-card rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl bg-purple-50 dark:bg-secondary`}>
                <Shield
                  className={`w-5 h-5 text-purple-600 dark:text-gray-300`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Security
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Password and account security
                </p>
              </div>
              <div className="text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </Link>
        </div>
      </FixedHeaderLayout>
    </div>
  );
};

export default ProfilePage;
