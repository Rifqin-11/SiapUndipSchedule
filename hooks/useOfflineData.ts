import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useOnlineStatus } from "./useOnlineStatus";
import { offlineDataManager, CACHE_KEYS } from "@/lib/offline-manager";

/**
 * Hook untuk data yang mendukung offline dengan cache fallback
 */
export function useOfflineQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  cacheKey: string,
  options?: {
    staleTime?: number;
    gcTime?: number;
    enabled?: boolean;
  }
) {
  const { isOnline } = useOnlineStatus();
  const queryClient = useQueryClient();

  // React Query dengan offline support
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const data = await queryFn();
        // Store in offline cache when online
        if (isOnline) {
          offlineDataManager.setCache(cacheKey, data);
        }
        return data;
      } catch (error) {
        // Fallback to offline cache if request fails
        if (!isOnline) {
          const cachedData = offlineDataManager.getCache<T>(cacheKey);
          if (cachedData) {
            console.log(`[OfflineQuery] Using cached data for ${cacheKey}`);
            return cachedData;
          }
        }
        throw error;
      }
    },
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
    gcTime: options?.gcTime ?? 10 * 60 * 1000, // 10 minutes
    enabled: options?.enabled ?? true,
    retry: (failureCount, error) => {
      // Don't retry if offline
      if (!isOnline) return false;
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Try to get cached data immediately if offline and query is loading
  useEffect(() => {
    if (!isOnline && query.isLoading && !query.data) {
      const cachedData = offlineDataManager.getCache<T>(cacheKey);
      if (cachedData) {
        console.log(`[OfflineQuery] Seeding cache for ${cacheKey}`);
        queryClient.setQueryData(queryKey, cachedData);
      }
    }
  }, [isOnline, query.isLoading, query.data, queryKey, cacheKey, queryClient]);

  return {
    ...query,
    isOffline: !isOnline,
    hasCachedData: !!offlineDataManager.getCache<T>(cacheKey),
  };
}

/**
 * Hook untuk subjects dengan offline support
 */
export function useOfflineSubjects() {
  return useOfflineQuery(
    ["subjects"],
    async () => {
      const response = await fetch("/api/subjects", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch subjects");
      const data = await response.json();
      return data.data;
    },
    CACHE_KEYS.SUBJECTS
  );
}

/**
 * Hook untuk tasks dengan offline support
 */
export function useOfflineTasks() {
  return useOfflineQuery(
    ["tasks"],
    async () => {
      const response = await fetch("/api/tasks", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch tasks");
      const data = await response.json();
      return data.data;
    },
    CACHE_KEYS.TASKS
  );
}

/**
 * Hook untuk user profile dengan offline support
 */
export function useOfflineUserProfile() {
  return useOfflineQuery(
    ["user", "profile"],
    async () => {
      const response = await fetch("/api/user/profile", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch user profile");
      const data = await response.json();
      return data.data;
    },
    CACHE_KEYS.USER_PROFILE
  );
}

/**
 * Hook untuk schedule dengan offline support
 */
export function useOfflineSchedule(date?: string) {
  const queryKey = date ? ["schedule", date] : ["schedule"];
  const cacheKey = date
    ? `${CACHE_KEYS.SCHEDULE}_${date}`
    : CACHE_KEYS.SCHEDULE;

  return useOfflineQuery(
    queryKey,
    async () => {
      const url = date ? `/api/schedule?date=${date}` : "/api/schedule";
      const response = await fetch(url, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch schedule");
      const data = await response.json();
      return data.data;
    },
    cacheKey
  );
}

/**
 * Hook untuk attendance history dengan offline support
 */
export function useOfflineAttendanceHistory() {
  return useOfflineQuery(
    ["attendance-history"],
    async () => {
      const response = await fetch("/api/attendance-history", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch attendance history");
      const data = await response.json();
      return data.data;
    },
    CACHE_KEYS.ATTENDANCE_HISTORY
  );
}

/**
 * Hook untuk settings dengan offline support
 */
export function useOfflineSettings() {
  return useOfflineQuery(
    ["settings"],
    async () => {
      const response = await fetch("/api/settings", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch settings");
      const data = await response.json();
      return data.data;
    },
    CACHE_KEYS.SETTINGS
  );
}

/**
 * Hook untuk auto-sync saat kembali online
 */
export function useOfflineSync() {
  const { isOnline } = useOnlineStatus();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOnline) {
      console.log("[OfflineSync] Device back online, syncing data...");

      // Process offline queue
      offlineDataManager.processQueue().catch((error) => {
        console.error("[OfflineSync] Failed to process queue:", error);
      });

      // Refetch all queries to get fresh data
      queryClient.refetchQueries({
        type: "active",
        stale: true,
      });
    }
  }, [isOnline, queryClient]);

  return {
    isOnline,
    syncInProgress: !isOnline,
  };
}
