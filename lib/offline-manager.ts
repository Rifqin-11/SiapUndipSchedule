// Offline data management utilities
// Mengelola data yang tersimpan di localStorage/IndexedDB untuk akses offline

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  key: string;
}

interface OfflineQueueItem {
  id: string;
  url: string;
  method: string;
  body?: any;
  headers?: Record<string, string>;
  timestamp: number;
  retries: number;
}

class OfflineDataManager {
  private readonly CACHE_PREFIX = "siap_undip_cache_";
  private readonly QUEUE_KEY = "siap_undip_offline_queue";
  private readonly MAX_CACHE_AGE = 24 * 60 * 60 * 1000; // 24 hours
  private readonly MAX_RETRIES = 3;

  /**
   * Store data in localStorage with expiration
   */
  setCache<T>(key: string, data: T, maxAge: number = this.MAX_CACHE_AGE): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + maxAge,
        key,
      };

      localStorage.setItem(`${this.CACHE_PREFIX}${key}`, JSON.stringify(entry));

      console.log(`[OfflineCache] Stored ${key}`);
    } catch (error) {
      console.error(`[OfflineCache] Failed to store ${key}:`, error);
    }
  }

  /**
   * Get data from localStorage cache
   */
  getCache<T>(key: string): T | null {
    try {
      const stored = localStorage.getItem(`${this.CACHE_PREFIX}${key}`);
      if (!stored) return null;

      const entry: CacheEntry<T> = JSON.parse(stored);

      // Check if cache has expired
      if (Date.now() > entry.expiresAt) {
        this.removeCache(key);
        console.log(`[OfflineCache] Cache expired for ${key}`);
        return null;
      }

      console.log(`[OfflineCache] Retrieved ${key}`);
      return entry.data;
    } catch (error) {
      console.error(`[OfflineCache] Failed to retrieve ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove data from cache
   */
  removeCache(key: string): void {
    try {
      localStorage.removeItem(`${this.CACHE_PREFIX}${key}`);
      console.log(`[OfflineCache] Removed ${key}`);
    } catch (error) {
      console.error(`[OfflineCache] Failed to remove ${key}:`, error);
    }
  }

  /**
   * Get all cached keys
   */
  getCachedKeys(): string[] {
    try {
      const keys = Object.keys(localStorage)
        .filter((key) => key.startsWith(this.CACHE_PREFIX))
        .map((key) => key.replace(this.CACHE_PREFIX, ""));

      return keys;
    } catch (error) {
      console.error("[OfflineCache] Failed to get cached keys:", error);
      return [];
    }
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    try {
      const keys = Object.keys(localStorage).filter((key) =>
        key.startsWith(this.CACHE_PREFIX)
      );

      keys.forEach((key) => localStorage.removeItem(key));
      console.log("[OfflineCache] Cleared all cache");
    } catch (error) {
      console.error("[OfflineCache] Failed to clear cache:", error);
    }
  }

  /**
   * Add request to offline queue
   */
  addToQueue(
    url: string,
    method: string = "GET",
    body?: any,
    headers?: Record<string, string>
  ): void {
    try {
      const queue = this.getQueue();
      const item: OfflineQueueItem = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        url,
        method,
        body,
        headers,
        timestamp: Date.now(),
        retries: 0,
      };

      queue.push(item);
      localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));

      console.log(`[OfflineQueue] Added ${method} ${url}`);
    } catch (error) {
      console.error("[OfflineQueue] Failed to add to queue:", error);
    }
  }

  /**
   * Get offline queue
   */
  getQueue(): OfflineQueueItem[] {
    try {
      const stored = localStorage.getItem(this.QUEUE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("[OfflineQueue] Failed to get queue:", error);
      return [];
    }
  }

  /**
   * Process offline queue when back online
   */
  async processQueue(): Promise<void> {
    const queue = this.getQueue();
    if (queue.length === 0) return;

    console.log(`[OfflineQueue] Processing ${queue.length} items`);

    const failedItems: OfflineQueueItem[] = [];

    for (const item of queue) {
      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: {
            "Content-Type": "application/json",
            ...item.headers,
          },
          body: item.body ? JSON.stringify(item.body) : undefined,
        });

        if (response.ok) {
          console.log(
            `[OfflineQueue] Successfully processed ${item.method} ${item.url}`
          );
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        console.error(`[OfflineQueue] Failed to process ${item.url}:`, error);

        // Retry logic
        if (item.retries < this.MAX_RETRIES) {
          failedItems.push({
            ...item,
            retries: item.retries + 1,
          });
        } else {
          console.error(`[OfflineQueue] Max retries reached for ${item.url}`);
        }
      }
    }

    // Update queue with failed items
    localStorage.setItem(this.QUEUE_KEY, JSON.stringify(failedItems));

    if (failedItems.length === 0) {
      console.log("[OfflineQueue] All items processed successfully");
    } else {
      console.log(
        `[OfflineQueue] ${failedItems.length} items failed, will retry later`
      );
    }
  }

  /**
   * Clear offline queue
   */
  clearQueue(): void {
    try {
      localStorage.removeItem(this.QUEUE_KEY);
      console.log("[OfflineQueue] Cleared queue");
    } catch (error) {
      console.error("[OfflineQueue] Failed to clear queue:", error);
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    totalItems: number;
    totalSize: string;
    oldestItem?: string;
    newestItem?: string;
    queueSize: number;
  } {
    try {
      const keys = this.getCachedKeys();
      let totalSize = 0;
      let oldestTimestamp = Infinity;
      let newestTimestamp = 0;
      let oldestKey = "";
      let newestKey = "";

      keys.forEach((key) => {
        const stored = localStorage.getItem(`${this.CACHE_PREFIX}${key}`);
        if (stored) {
          totalSize += stored.length;
          const entry = JSON.parse(stored);

          if (entry.timestamp < oldestTimestamp) {
            oldestTimestamp = entry.timestamp;
            oldestKey = key;
          }

          if (entry.timestamp > newestTimestamp) {
            newestTimestamp = entry.timestamp;
            newestKey = key;
          }
        }
      });

      return {
        totalItems: keys.length,
        totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
        oldestItem: oldestKey || undefined,
        newestItem: newestKey || undefined,
        queueSize: this.getQueue().length,
      };
    } catch (error) {
      console.error("[OfflineCache] Failed to get stats:", error);
      return {
        totalItems: 0,
        totalSize: "0 KB",
        queueSize: 0,
      };
    }
  }
}

// Export singleton instance
export const offlineDataManager = new OfflineDataManager();

// Export specific cache keys used throughout the app
export const CACHE_KEYS = {
  SUBJECTS: "subjects",
  TASKS: "tasks",
  USER_PROFILE: "user_profile",
  SCHEDULE: "schedule",
  ATTENDANCE_HISTORY: "attendance_history",
  SETTINGS: "settings",
} as const;
