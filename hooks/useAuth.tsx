"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";

interface User {
  id: string;
  name: string;
  email: string;
  nim?: string | null;
  jurusan?: string | null;
  fakultas?: string | null;
  angkatan?: string | null;
  profileImage?: string;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isInitialLoad: boolean;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    userData: RegisterData
  ) => Promise<{ success: boolean; error?: string; passwordErrors?: string[] }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  nim?: string;
  jurusan?: string;
  fakultas?: string;
  angkatan?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Optimistic loading: Check localStorage first
  useEffect(() => {
    const cachedUser = localStorage.getItem("auth_user");
    const cachedExpiry = localStorage.getItem("auth_expiry");

    if (cachedUser && cachedExpiry) {
      const now = Date.now();
      const expiry = parseInt(cachedExpiry);

      // If cache is still valid (less than 30 minutes old)
      if (now < expiry) {
        try {
          const parsedUser = JSON.parse(cachedUser);
          setUser(parsedUser);
          setLoading(false);
          setIsInitialLoad(false);

          // Still verify in background
          setTimeout(() => checkAuth(), 100);
          return;
        } catch (error) {
          // If parsing fails, clear cache and continue with normal flow
          localStorage.removeItem("auth_user");
          localStorage.removeItem("auth_expiry");
        }
      } else {
        // Cache expired, clear it
        localStorage.removeItem("auth_user");
        localStorage.removeItem("auth_expiry");
      }
    }

    // Normal auth check if no valid cache
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
        // Add cache headers for production optimization
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.user);

          // Cache the user data for 30 minutes
          const expiry = Date.now() + 30 * 60 * 1000;
          localStorage.setItem("auth_user", JSON.stringify(data.user));
          localStorage.setItem("auth_expiry", expiry.toString());
        } else {
          setUser(null);
          // Clear cache on auth failure
          localStorage.removeItem("auth_user");
          localStorage.removeItem("auth_expiry");
        }
      } else {
        setUser(null);
        localStorage.removeItem("auth_user");
        localStorage.removeItem("auth_expiry");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      // On network error, don't clear cache if we have valid cached user
      if (!user) {
        setUser(null);
      }
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  };

  const login = async (
    email: string,
    password: string,
    rememberMe: boolean = false
  ) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);

        // Cache the user data for 30 minutes after successful login
        const expiry = Date.now() + 30 * 60 * 1000;
        localStorage.setItem("auth_user", JSON.stringify(data.user));
        localStorage.setItem("auth_expiry", expiry.toString());

        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Network error. Please try again." };
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        return { success: true };
      } else {
        return {
          success: false,
          error: data.error,
          passwordErrors: data.passwordErrors,
        };
      }
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, error: "Network error. Please try again." };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      // Clear cache on logout
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_expiry");
    }
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  const value: AuthContextType = {
    user,
    loading,
    isInitialLoad,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Hook for protected routes
export const useAuthRequired = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login page
      window.location.href = "/auth/login";
    }
  }, [user, loading]);

  return { user, loading, isAuthenticated: !!user };
};
