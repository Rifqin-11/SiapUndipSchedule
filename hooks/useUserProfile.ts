"use client";

import { useAuth } from "./useAuth";

export interface UserProfile {
  id: string;
  name: string;
  nim?: string | null;
  email: string;
  jurusan?: string | null;
  fakultas?: string | null;
  angkatan?: string | null;
  profileImage?: string;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
}

export const useUserProfile = () => {
  const { user, loading, refreshUser } = useAuth();

  const updateUserProfile = async (profileData: Partial<UserProfile>) => {
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh user data after successful update
        await refreshUser();
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      console.error("Error updating user profile:", err);
      const errorMessage = "Failed to update profile";
      return { success: false, error: errorMessage };
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return {
    user,
    loading,
    error: null, // Auth provider handles errors
    updateUserProfile,
    refetch: refreshUser,
    refetchUser: refreshUser,
    getInitials,
  };
};
