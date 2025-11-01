"use client";

import { useState, useEffect, useRef } from "react";

interface UseScrollOpacityOptions {
  /** Jarak scroll (px) dimana header akan sepenuhnya hilang (opacity 0) */
  fadeDistance?: number;
  /** Offset awal scroll sebelum fade dimulai */
  startOffset?: number;
}

/**
 * Hook untuk menghitung opacity header berdasarkan posisi scroll
 * @param options - Konfigurasi untuk fade effect
 * @returns opacity value (0-1)
 */
export function useScrollOpacity(options: UseScrollOpacityOptions = {}) {
  const { fadeDistance = 150, startOffset = 0 } = options;
  const [opacity, setOpacity] = useState(1);
  const isInitialized = useRef(false);

  useEffect(() => {
    const calculateOpacity = () => {
      const scrollY = window.scrollY;

      // Jika scroll belum mencapai start offset, opacity tetap 1
      if (scrollY <= startOffset) {
        return 1;
      }

      // Hitung progress scroll dari start offset
      const scrollProgress = scrollY - startOffset;

      // Hitung opacity berdasarkan fade distance
      const newOpacity = Math.max(0, 1 - scrollProgress / fadeDistance);

      return newOpacity;
    };

    const handleScroll = () => {
      const newOpacity = calculateOpacity();
      setOpacity(newOpacity);
    };

    const handlePageShow = () => {
      // Recalculate opacity when page becomes visible (e.g., back navigation)
      const newOpacity = calculateOpacity();
      setOpacity(newOpacity);
    };

    // Set initial opacity immediately
    const initialOpacity = calculateOpacity();
    setOpacity(initialOpacity);
    isInitialized.current = true;

    // Add scroll listener
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Add pageshow listener for back navigation
    window.addEventListener("pageshow", handlePageShow);

    // Cleanup
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [fadeDistance, startOffset]);

  // Additional effect to handle route changes and ensure proper initialization
  useEffect(() => {
    if (!isInitialized.current) {
      const calculateOpacity = () => {
        const scrollY = window.scrollY;

        if (scrollY <= startOffset) {
          return 1;
        }

        const scrollProgress = scrollY - startOffset;
        const newOpacity = Math.max(0, 1 - scrollProgress / fadeDistance);

        return newOpacity;
      };

      const newOpacity = calculateOpacity();
      setOpacity(newOpacity);
      isInitialized.current = true;
    }
  });

  return opacity;
}
