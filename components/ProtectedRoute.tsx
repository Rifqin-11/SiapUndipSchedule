"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, isInitialLoad } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we're done with initial loading and have no user
    if (!loading && !isInitialLoad && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, isInitialLoad, router]);

  // Always show content immediately if we have a user (optimistic loading)
  // Or if we're still checking auth in background
  return <>{children}</>;
}
