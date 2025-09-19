"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import WebSocketProvider from "./WebSocketProvider";
import PrefetchProvider from "./PrefetchProvider";
import AnalyticsProvider from "./AnalyticsProvider";
import { ABTestingProvider } from "./ABTestingProvider";

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data akan dianggap fresh selama 30 detik untuk responsivitas yang sangat baik
            staleTime: 30 * 1000, // 30 seconds (sangat dikurangi untuk menghindari stale cache)
            // Data akan di-cache selama 2 menit saja
            gcTime: 2 * 60 * 1000, // 2 minutes (dikurangi drastis)
            // Tidak refetch saat window focus untuk mengurangi network requests
            refetchOnWindowFocus: false,
            // Refetch saat reconnect untuk data terbaru
            refetchOnReconnect: true,
            // Refetch saat mount untuk memastikan data fresh
            refetchOnMount: "always",
            // Retry sekali jika ada error
            retry: 1,
            // Retry delay yang progressif
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            // Retry mutation sekali jika gagal
            retry: 1,
            // Tambahkan networkMode untuk handle offline scenarios
            networkMode: "online",
            // Retry delay untuk mutations
            retryDelay: 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ABTestingProvider>
        <WebSocketProvider />
        <PrefetchProvider />
        <AnalyticsProvider />
        {children}
      </ABTestingProvider>
      {/* React Query DevTools hanya muncul di development */}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
