import { useState, useEffect } from "react";

export interface UserProfile {
  id: string;
  name: string;
  nim: string;
  email: string;
  jurusan: string;
  fakultas: string;
  angkatan: string;
  profileImage?: string;
}

export const useUserProfile = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/user/profile");
      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setError(null);
      } else {
        setError(data.error || "Failed to fetch user profile");
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setError("Failed to fetch user profile");
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (profileData: Partial<UserProfile>) => {
    try {
      setLoading(true);
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setError(null);
        return { success: true, user: data.user };
      } else {
        setError(data.error || "Failed to update profile");
        return { success: false, error: data.error };
      }
    } catch (err) {
      console.error("Error updating user profile:", err);
      const errorMessage = "Failed to update profile";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
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

  useEffect(() => {
    fetchUserProfile();
  }, []);

  return {
    user,
    loading,
    error,
    updateUserProfile,
    refetchUser: fetchUserProfile,
    getInitials,
  };
};
