"use client";

import {
  QueryClient,
  QueryClientProvider,
  MutationCache,
  QueryCache,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { toast } from "sonner";
import "./ui/toast-mobile.css";

interface QueryProviderProps {
  children: React.ReactNode;
}

// Custom error handler for queries
const handleQueryError = (error: unknown) => {
  const message = error instanceof Error ? error.message : "An error occurred";

  // Don't show toast for cancelled requests
  if (message.includes("cancelled") || message.includes("aborted")) {
    return;
  }

  // Show user-friendly error messages
  if (message.includes("Network Error") || message.includes("fetch")) {
    toast.error("Connection problem. Please check your internet connection.");
  } else {
    toast.error("Something went wrong. Please try again.");
  }

  console.error("Query Error:", error);
};

// Custom error handler for mutations
const handleMutationError = (error: unknown) => {
  const message = error instanceof Error ? error.message : "An error occurred";

  // Show appropriate error message
  if (message.includes("Network Error") || message.includes("fetch")) {
    toast.error("Connection problem. Please check your internet connection.");
  } else if (message.includes("Unauthorized") || message.includes("401")) {
    toast.error("Your session has expired. Please log in again.");
  } else if (message.includes("Forbidden") || message.includes("403")) {
    toast.error("You do not have permission to perform this action.");
  } else {
    toast.error("Failed to save changes. Please try again.");
  }

  console.error("Mutation Error:", error);
};

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: handleQueryError,
        }),
        mutationCache: new MutationCache({
          onError: handleMutationError,
        }),
        defaultOptions: {
          queries: {
            // Optimized stale time based on data type - reduced for critical data
            staleTime: 30 * 1000, // 30 seconds for faster updates

            // Longer garbage collection time to improve performance
            gcTime: 10 * 60 * 1000, // 10 minutes - keep data longer for better UX

            // Disable refetch on window focus for better performance
            refetchOnWindowFocus: false,

            // Refetch on reconnect to get fresh data after connection restored
            refetchOnReconnect: true,

            // Disable refetch on mount for faster initial load
            refetchOnMount: false, // Changed to false for faster loading

            // Retry configuration for better reliability - reduced for faster failure
            retry: (failureCount, error) => {
              // Don't retry for certain errors
              if (error instanceof Error) {
                if (
                  error.message.includes("401") ||
                  error.message.includes("403") ||
                  error.message.includes("404")
                ) {
                  return false;
                }
              }
              return failureCount < 2; // Reduced retry count for faster failure
            },

            // Progressive retry delay - reduced for faster retries
            retryDelay: (attemptIndex) =>
              Math.min(500 * 2 ** attemptIndex, 5000), // Faster retry delays

            // Enable background updates for better UX
            refetchInterval: false, // Disable automatic polling by default

            // Optimize for offline scenarios
            networkMode: "online",
          },
          mutations: {
            // Retry mutations with exponential backoff
            retry: (failureCount, error) => {
              // Don't retry for client errors
              if (error instanceof Error) {
                if (
                  error.message.includes("400") ||
                  error.message.includes("401") ||
                  error.message.includes("403")
                ) {
                  return false;
                }
              }
              return failureCount < 2;
            },

            // Mutation retry delay
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 10000),

            // Only run mutations when online
            networkMode: "online",
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* React Query DevTools hanya muncul di development */}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-left"
        />
      )}
    </QueryClientProvider>
  );
}
