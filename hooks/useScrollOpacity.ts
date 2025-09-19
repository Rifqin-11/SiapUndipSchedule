"use client";

import { useState, useEffect } from 'react';

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

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      // Jika scroll belum mencapai start offset, opacity tetap 1
      if (scrollY <= startOffset) {
        setOpacity(1);
        return;
      }

      // Hitung progress scroll dari start offset
      const scrollProgress = scrollY - startOffset;
      
      // Hitung opacity berdasarkan fade distance
      const newOpacity = Math.max(0, 1 - (scrollProgress / fadeDistance));
      
      setOpacity(newOpacity);
    };

    // Set initial opacity
    handleScroll();

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [fadeDistance, startOffset]);

  return opacity;
}