"use client";

import { usePrefetch } from "@/hooks/usePrefetch";

export default function PrefetchProvider() {
  // Initialize advanced prefetching system
  usePrefetch();

  // This component doesn't render anything - it just initializes prefetching
  return null;
}
